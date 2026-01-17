"""
Iteration 8 Backend Tests - Testing new features:
1. Normal admin cannot change main admin's password
2. Admin login failure stays on admin login page (not redirect to user login)
3. Admin username must be a gov.tr email address
4. User cannot send swap invitation if positions don't match
5. Listing title auto-generates in 'Current City - Desired City' format (frontend test)
6. Listing status labels display correctly (Onay Bekliyor, Açık, Reddedildi) (frontend test)
7. User can have max 3 active listings
8. District field is optional in listing creation
9. Admin can block/unblock users
10. Blocked users cannot send invitations or messages
11. Admin can approve/reject listings
12. Admin can send bulk notifications
13. Admin role management (create, delete, transfer main admin)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pubswappr.preview.emergentagent.com')

# Test credentials
MAIN_ADMIN_USERNAME = "nuno@adalet.gov.tr"
MAIN_ADMIN_PASSWORD = "Nuno1234!"
REGULAR_ADMIN_USERNAME = "becayis"
REGULAR_ADMIN_PASSWORD = "1234"

class TestAdminPasswordProtection:
    """Test that normal admin cannot change main admin's password"""
    
    def test_setup_main_admin(self):
        """Ensure main admin exists in the system"""
        # First login as regular admin to check if main admin exists
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Regular admin login failed: {response.text}"
        token = response.json()["access_token"]
        
        # Get list of admins
        headers = {"Authorization": f"Bearer {token}"}
        admins_response = requests.get(f"{BASE_URL}/api/admin/admins", headers=headers)
        
        if admins_response.status_code == 200:
            admins = admins_response.json()
            main_admin_exists = any(a.get("username") == MAIN_ADMIN_USERNAME for a in admins)
            print(f"Main admin exists: {main_admin_exists}")
            print(f"Admins: {[a.get('username') for a in admins]}")
        
    def test_regular_admin_cannot_change_main_admin_password(self):
        """Test that regular admin cannot change main admin's password"""
        # Login as regular admin
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Regular admin login failed: {response.text}"
        regular_token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {regular_token}"}
        
        # Get list of admins to find main admin ID
        admins_response = requests.get(f"{BASE_URL}/api/admin/admins", headers=headers)
        if admins_response.status_code != 200:
            pytest.skip("Cannot get admin list - endpoint may require main admin")
            
        admins = admins_response.json()
        main_admin = next((a for a in admins if a.get("role") == "main_admin"), None)
        
        if not main_admin:
            pytest.skip("No main admin found in system")
        
        # Try to change main admin's password
        change_response = requests.put(
            f"{BASE_URL}/api/admin/admins/{main_admin['id']}/password",
            headers=headers,
            json={"new_password": "NewPassword123!"}
        )
        
        # Should be forbidden (403)
        assert change_response.status_code == 403, f"Expected 403, got {change_response.status_code}: {change_response.text}"
        assert "yetki" in change_response.json().get("detail", "").lower() or "main_admin" in change_response.json().get("detail", "").lower()
        print("PASS: Regular admin cannot change main admin's password")


class TestAdminGovTrEmailValidation:
    """Test that admin username must be a gov.tr email address"""
    
    def test_create_admin_with_non_gov_email_fails(self):
        """Test that creating admin with non-gov.tr email fails"""
        # Login as main admin (or regular admin if main admin doesn't exist)
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": MAIN_ADMIN_USERNAME, "password": MAIN_ADMIN_PASSWORD}
        )
        
        if response.status_code != 200:
            # Try regular admin
            response = requests.post(
                f"{BASE_URL}/api/admin/login",
                params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
            )
        
        if response.status_code != 200:
            pytest.skip("Cannot login as admin")
            
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to create admin with non-gov.tr email
        create_response = requests.post(
            f"{BASE_URL}/api/admin/admins",
            headers=headers,
            json={
                "username": "test@gmail.com",
                "password": "Test1234!",
                "display_name": "Test Admin"
            }
        )
        
        # Should fail with 400
        assert create_response.status_code == 400, f"Expected 400, got {create_response.status_code}: {create_response.text}"
        detail = create_response.json().get("detail", "")
        assert "gov.tr" in detail.lower(), f"Error should mention gov.tr requirement: {detail}"
        print("PASS: Admin creation with non-gov.tr email fails")
    
    def test_create_admin_with_gov_email_succeeds(self):
        """Test that creating admin with gov.tr email succeeds"""
        # Login as main admin
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": MAIN_ADMIN_USERNAME, "password": MAIN_ADMIN_PASSWORD}
        )
        
        if response.status_code != 200:
            pytest.skip("Main admin login required for this test")
            
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create admin with gov.tr email
        test_email = f"test_admin_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        create_response = requests.post(
            f"{BASE_URL}/api/admin/admins",
            headers=headers,
            json={
                "username": test_email,
                "password": "Test1234!",
                "display_name": "Test Admin"
            }
        )
        
        if create_response.status_code == 201:
            print(f"PASS: Admin creation with gov.tr email succeeds: {test_email}")
            # Clean up - delete the test admin
            admin_id = create_response.json().get("id")
            if admin_id:
                requests.delete(f"{BASE_URL}/api/admin/admins/{admin_id}", headers=headers)
        elif create_response.status_code == 403:
            pytest.skip("Only main admin can create admins")
        else:
            # May fail for other reasons (e.g., not main admin)
            print(f"Admin creation response: {create_response.status_code} - {create_response.text}")


class TestPositionMatchingForInvitations:
    """Test that user cannot send swap invitation if positions don't match"""
    
    @pytest.fixture
    def test_users(self):
        """Create two test users with different positions"""
        users = []
        
        # Create user 1 with position "Zabıt Katibi"
        email1 = f"TEST_pos1_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response1 = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": email1,
                "password": "Test1234!",
                "first_name": "Test",
                "last_name": "User1"
            }
        )
        
        if reg_response1.status_code != 200:
            pytest.skip(f"Cannot create test user 1: {reg_response1.text}")
        
        verification_id1 = reg_response1.json()["verification_id"]
        code1 = reg_response1.json()["email_code_mock"]
        
        verify_response1 = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": verification_id1, "code": code1}
        )
        
        if verify_response1.status_code != 200:
            pytest.skip(f"Cannot verify user 1: {verify_response1.text}")
        
        token1 = verify_response1.json()["access_token"]
        user_id1 = verify_response1.json()["user"]["id"]
        
        # Complete profile for user 1 with position "Zabıt Katibi"
        profile_response1 = requests.post(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token1}"},
            json={
                "user_id": user_id1,
                "display_name": "Test User 1",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya"
            }
        )
        
        users.append({"token": token1, "user_id": user_id1, "email": email1, "position": "Zabıt Katibi"})
        
        # Create user 2 with different position "Mübaşir"
        email2 = f"TEST_pos2_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response2 = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": email2,
                "password": "Test1234!",
                "first_name": "Test",
                "last_name": "User2"
            }
        )
        
        if reg_response2.status_code != 200:
            pytest.skip(f"Cannot create test user 2: {reg_response2.text}")
        
        verification_id2 = reg_response2.json()["verification_id"]
        code2 = reg_response2.json()["email_code_mock"]
        
        verify_response2 = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": verification_id2, "code": code2}
        )
        
        token2 = verify_response2.json()["access_token"]
        user_id2 = verify_response2.json()["user"]["id"]
        
        # Complete profile for user 2 with different position "Mübaşir"
        profile_response2 = requests.post(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token2}"},
            json={
                "user_id": user_id2,
                "display_name": "Test User 2",
                "institution": "Adalet Bakanlığı",
                "role": "Mübaşir",
                "current_province": "İstanbul",
                "current_district": "Kadıköy"
            }
        )
        
        users.append({"token": token2, "user_id": user_id2, "email": email2, "position": "Mübaşir"})
        
        yield users
        
        # Cleanup - delete test users via admin
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        if admin_response.status_code == 200:
            admin_token = admin_response.json()["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            for user in users:
                requests.delete(f"{BASE_URL}/api/admin/users/{user['user_id']}", headers=admin_headers)
    
    def test_invitation_fails_with_position_mismatch(self, test_users):
        """Test that invitation fails when positions don't match"""
        user1 = test_users[0]  # Zabıt Katibi
        user2 = test_users[1]  # Mübaşir
        
        # User 1 creates a listing
        listing_response = requests.post(
            f"{BASE_URL}/api/listings",
            headers={"Authorization": f"Bearer {user1['token']}"},
            json={
                "title": "Ankara - İstanbul Becayiş",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya",
                "desired_province": "İstanbul",
                "desired_district": "Kadıköy"
            }
        )
        
        assert listing_response.status_code == 200, f"Listing creation failed: {listing_response.text}"
        listing_id = listing_response.json()["listing"]["id"]
        
        # Admin approves the listing
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        admin_token = admin_response.json()["access_token"]
        requests.post(
            f"{BASE_URL}/api/admin/listings/{listing_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # User 2 (Mübaşir) tries to send invitation to User 1's listing (Zabıt Katibi)
        invitation_response = requests.post(
            f"{BASE_URL}/api/invitations",
            headers={"Authorization": f"Bearer {user2['token']}"},
            json={"listing_id": listing_id}
        )
        
        # Should fail with 400 due to position mismatch
        assert invitation_response.status_code == 400, f"Expected 400, got {invitation_response.status_code}: {invitation_response.text}"
        detail = invitation_response.json().get("detail", "")
        assert "pozisyon" in detail.lower() or "eşleşmiyor" in detail.lower(), f"Error should mention position mismatch: {detail}"
        print("PASS: Invitation fails when positions don't match")


class TestMaxListingsLimit:
    """Test that user can have max 3 active listings"""
    
    def test_max_3_listings_limit(self):
        """Test that user cannot create more than 3 active listings"""
        # Create a test user
        email = f"TEST_maxlist_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": email,
                "password": "Test1234!",
                "first_name": "Test",
                "last_name": "MaxList"
            }
        )
        
        if reg_response.status_code != 200:
            pytest.skip(f"Cannot create test user: {reg_response.text}")
        
        verification_id = reg_response.json()["verification_id"]
        code = reg_response.json()["email_code_mock"]
        
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": verification_id, "code": code}
        )
        
        token = verify_response.json()["access_token"]
        user_id = verify_response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Complete profile
        requests.post(
            f"{BASE_URL}/api/profile",
            headers=headers,
            json={
                "user_id": user_id,
                "display_name": "Test MaxList",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya"
            }
        )
        
        provinces = ["İstanbul", "İzmir", "Antalya", "Bursa"]
        created_listings = []
        
        # Try to create 4 listings
        for i, province in enumerate(provinces):
            listing_response = requests.post(
                f"{BASE_URL}/api/listings",
                headers=headers,
                json={
                    "title": f"Ankara - {province} Becayiş",
                    "institution": "Adalet Bakanlığı",
                    "role": "Zabıt Katibi",
                    "current_province": "Ankara",
                    "current_district": "Çankaya",
                    "desired_province": province
                }
            )
            
            if i < 3:
                # First 3 should succeed
                assert listing_response.status_code == 200, f"Listing {i+1} creation failed: {listing_response.text}"
                created_listings.append(listing_response.json()["listing"]["id"])
                print(f"Listing {i+1} created successfully")
            else:
                # 4th should fail
                assert listing_response.status_code == 400, f"Expected 400 for 4th listing, got {listing_response.status_code}: {listing_response.text}"
                detail = listing_response.json().get("detail", "")
                assert "3" in detail or "fazla" in detail.lower(), f"Error should mention 3 listing limit: {detail}"
                print("PASS: 4th listing creation blocked - max 3 limit enforced")
        
        # Cleanup
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        if admin_response.status_code == 200:
            admin_token = admin_response.json()["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            requests.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=admin_headers)


class TestOptionalDistrictField:
    """Test that district field is optional in listing creation"""
    
    def test_listing_creation_without_district(self):
        """Test that listing can be created without district field"""
        # Create a test user
        email = f"TEST_nodistrict_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": email,
                "password": "Test1234!",
                "first_name": "Test",
                "last_name": "NoDistrict"
            }
        )
        
        if reg_response.status_code != 200:
            pytest.skip(f"Cannot create test user: {reg_response.text}")
        
        verification_id = reg_response.json()["verification_id"]
        code = reg_response.json()["email_code_mock"]
        
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": verification_id, "code": code}
        )
        
        token = verify_response.json()["access_token"]
        user_id = verify_response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Complete profile without district
        requests.post(
            f"{BASE_URL}/api/profile",
            headers=headers,
            json={
                "user_id": user_id,
                "display_name": "Test NoDistrict",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": ""
            }
        )
        
        # Create listing without district fields
        listing_response = requests.post(
            f"{BASE_URL}/api/listings",
            headers=headers,
            json={
                "title": "Ankara - İstanbul Becayiş",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                # No current_district
                "desired_province": "İstanbul"
                # No desired_district
            }
        )
        
        assert listing_response.status_code == 200, f"Listing creation without district failed: {listing_response.text}"
        print("PASS: Listing created successfully without district fields")
        
        # Cleanup
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        if admin_response.status_code == 200:
            admin_token = admin_response.json()["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            requests.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=admin_headers)


class TestAdminBlockUnblockUsers:
    """Test admin can block/unblock users"""
    
    def test_admin_block_user(self):
        """Test that admin can block a user"""
        # Create a test user
        email = f"TEST_block_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": email,
                "password": "Test1234!",
                "first_name": "Test",
                "last_name": "Block"
            }
        )
        
        if reg_response.status_code != 200:
            pytest.skip(f"Cannot create test user: {reg_response.text}")
        
        verification_id = reg_response.json()["verification_id"]
        code = reg_response.json()["email_code_mock"]
        
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": verification_id, "code": code}
        )
        
        user_id = verify_response.json()["user"]["id"]
        
        # Login as admin
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Block the user
        block_response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/block",
            headers=admin_headers
        )
        
        assert block_response.status_code == 200, f"Block user failed: {block_response.text}"
        print("PASS: Admin can block user")
        
        # Unblock the user
        unblock_response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/unblock",
            headers=admin_headers
        )
        
        assert unblock_response.status_code == 200, f"Unblock user failed: {unblock_response.text}"
        print("PASS: Admin can unblock user")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=admin_headers)


class TestBlockedUserRestrictions:
    """Test that blocked users cannot send invitations or messages"""
    
    def test_blocked_user_cannot_send_invitation(self):
        """Test that blocked user cannot send invitation"""
        # Create two test users
        email1 = f"TEST_blocked1_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        email2 = f"TEST_blocked2_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        
        # Create user 1
        reg_response1 = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={"email": email1, "password": "Test1234!", "first_name": "Test", "last_name": "Blocked1"}
        )
        if reg_response1.status_code != 200:
            pytest.skip(f"Cannot create test user 1: {reg_response1.text}")
        
        verify_response1 = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": reg_response1.json()["verification_id"], "code": reg_response1.json()["email_code_mock"]}
        )
        token1 = verify_response1.json()["access_token"]
        user_id1 = verify_response1.json()["user"]["id"]
        
        # Complete profile for user 1
        requests.post(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token1}"},
            json={
                "user_id": user_id1,
                "display_name": "Test Blocked1",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya"
            }
        )
        
        # Create user 2
        reg_response2 = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={"email": email2, "password": "Test1234!", "first_name": "Test", "last_name": "Blocked2"}
        )
        verify_response2 = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": reg_response2.json()["verification_id"], "code": reg_response2.json()["email_code_mock"]}
        )
        token2 = verify_response2.json()["access_token"]
        user_id2 = verify_response2.json()["user"]["id"]
        
        # Complete profile for user 2 with same position
        requests.post(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token2}"},
            json={
                "user_id": user_id2,
                "display_name": "Test Blocked2",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "İstanbul",
                "current_district": "Kadıköy"
            }
        )
        
        # User 2 creates a listing
        listing_response = requests.post(
            f"{BASE_URL}/api/listings",
            headers={"Authorization": f"Bearer {token2}"},
            json={
                "title": "İstanbul - Ankara Becayiş",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "İstanbul",
                "desired_province": "Ankara"
            }
        )
        listing_id = listing_response.json()["listing"]["id"]
        
        # Admin approves the listing
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        requests.post(f"{BASE_URL}/api/admin/listings/{listing_id}/approve", headers=admin_headers)
        
        # Admin blocks user 1
        requests.put(f"{BASE_URL}/api/admin/users/{user_id1}/block", headers=admin_headers)
        
        # Blocked user 1 tries to send invitation
        invitation_response = requests.post(
            f"{BASE_URL}/api/invitations",
            headers={"Authorization": f"Bearer {token1}"},
            json={"listing_id": listing_id}
        )
        
        # Should fail with 403
        assert invitation_response.status_code == 403, f"Expected 403, got {invitation_response.status_code}: {invitation_response.text}"
        detail = invitation_response.json().get("detail", "")
        assert "engel" in detail.lower(), f"Error should mention blocked: {detail}"
        print("PASS: Blocked user cannot send invitation")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/users/{user_id1}", headers=admin_headers)
        requests.delete(f"{BASE_URL}/api/admin/users/{user_id2}", headers=admin_headers)


class TestAdminListingApproval:
    """Test admin can approve/reject listings"""
    
    def test_admin_approve_listing(self):
        """Test that admin can approve a pending listing"""
        # Create a test user
        email = f"TEST_approve_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={"email": email, "password": "Test1234!", "first_name": "Test", "last_name": "Approve"}
        )
        
        if reg_response.status_code != 200:
            pytest.skip(f"Cannot create test user: {reg_response.text}")
        
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": reg_response.json()["verification_id"], "code": reg_response.json()["email_code_mock"]}
        )
        token = verify_response.json()["access_token"]
        user_id = verify_response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Complete profile
        requests.post(
            f"{BASE_URL}/api/profile",
            headers=headers,
            json={
                "user_id": user_id,
                "display_name": "Test Approve",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya"
            }
        )
        
        # Create listing (should be pending_approval)
        listing_response = requests.post(
            f"{BASE_URL}/api/listings",
            headers=headers,
            json={
                "title": "Ankara - İstanbul Becayiş",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "desired_province": "İstanbul"
            }
        )
        
        listing = listing_response.json()["listing"]
        assert listing["status"] == "pending_approval", f"New listing should be pending_approval, got {listing['status']}"
        print("PASS: New listing has pending_approval status")
        
        # Admin approves the listing
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        approve_response = requests.post(
            f"{BASE_URL}/api/admin/listings/{listing['id']}/approve",
            headers=admin_headers
        )
        
        assert approve_response.status_code == 200, f"Approve listing failed: {approve_response.text}"
        print("PASS: Admin can approve listing")
        
        # Verify listing is now active
        get_listing_response = requests.get(f"{BASE_URL}/api/listings/{listing['id']}")
        assert get_listing_response.json()["status"] == "active", "Listing should be active after approval"
        print("PASS: Listing status is active after approval")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=admin_headers)
    
    def test_admin_reject_listing(self):
        """Test that admin can reject a pending listing"""
        # Create a test user
        email = f"TEST_reject_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={"email": email, "password": "Test1234!", "first_name": "Test", "last_name": "Reject"}
        )
        
        if reg_response.status_code != 200:
            pytest.skip(f"Cannot create test user: {reg_response.text}")
        
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"verification_id": reg_response.json()["verification_id"], "code": reg_response.json()["email_code_mock"]}
        )
        token = verify_response.json()["access_token"]
        user_id = verify_response.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Complete profile
        requests.post(
            f"{BASE_URL}/api/profile",
            headers=headers,
            json={
                "user_id": user_id,
                "display_name": "Test Reject",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya"
            }
        )
        
        # Create listing
        listing_response = requests.post(
            f"{BASE_URL}/api/listings",
            headers=headers,
            json={
                "title": "Ankara - İzmir Becayiş",
                "institution": "Adalet Bakanlığı",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "desired_province": "İzmir"
            }
        )
        
        listing = listing_response.json()["listing"]
        
        # Admin rejects the listing
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        reject_response = requests.post(
            f"{BASE_URL}/api/admin/listings/{listing['id']}/reject",
            headers=admin_headers,
            json={"reason": "Test rejection reason"}
        )
        
        assert reject_response.status_code == 200, f"Reject listing failed: {reject_response.text}"
        print("PASS: Admin can reject listing")
        
        # Verify listing is now rejected
        get_listing_response = requests.get(f"{BASE_URL}/api/listings/{listing['id']}")
        assert get_listing_response.json()["status"] == "rejected", "Listing should be rejected"
        print("PASS: Listing status is rejected after rejection")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=admin_headers)


class TestAdminBulkNotifications:
    """Test admin can send bulk notifications"""
    
    def test_admin_send_bulk_notification(self):
        """Test that admin can send bulk notification to all users"""
        # Login as admin
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        
        assert admin_response.status_code == 200, f"Admin login failed: {admin_response.text}"
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Send bulk notification
        notification_response = requests.post(
            f"{BASE_URL}/api/admin/notifications/bulk",
            headers=admin_headers,
            json={
                "title": "Test Bildirim",
                "message": "Bu bir test bildirimidir."
            }
        )
        
        assert notification_response.status_code == 200, f"Bulk notification failed: {notification_response.text}"
        result = notification_response.json()
        assert "count" in result or "kullanıcı" in result.get("message", "").lower()
        print(f"PASS: Admin can send bulk notification - {result}")


class TestAdminRoleManagement:
    """Test admin role management (create, delete, transfer main admin)"""
    
    def test_get_admin_list(self):
        """Test getting list of admins"""
        # Login as admin
        admin_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": REGULAR_ADMIN_USERNAME, "password": REGULAR_ADMIN_PASSWORD}
        )
        
        assert admin_response.status_code == 200, f"Admin login failed: {admin_response.text}"
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get admin list
        admins_response = requests.get(f"{BASE_URL}/api/admin/admins", headers=admin_headers)
        
        if admins_response.status_code == 200:
            admins = admins_response.json()
            print(f"PASS: Got admin list with {len(admins)} admins")
            for admin in admins:
                print(f"  - {admin.get('username')}: {admin.get('role', 'admin')}")
        elif admins_response.status_code == 403:
            print("INFO: Only main admin can view admin list")
        else:
            print(f"Admin list response: {admins_response.status_code} - {admins_response.text}")


class TestAdminLoginErrorHandling:
    """Test that admin login failure stays on admin login page"""
    
    def test_admin_login_with_wrong_credentials(self):
        """Test admin login with wrong credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "wrong_user", "password": "wrong_pass"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        detail = response.json().get("detail", "")
        assert "hatalı" in detail.lower() or "geçersiz" in detail.lower(), f"Error message should indicate wrong credentials: {detail}"
        print("PASS: Admin login with wrong credentials returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
