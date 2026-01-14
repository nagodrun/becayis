"""
Test Registration Flow and Account Management
- New registration flow: Ad, Soyad, E-posta, Şifre
- E-posta doğrulama kodu gönderimi (MOCKED)
- E-posta doğrulama ile hesap oluşturma
- Kullanıcı kendi hesabını silme
- Profil güncelleme
- Admin kullanıcı silme
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRegistrationFlow:
    """Test new registration flow with email verification"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Generate unique email for each test run
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
    
    def test_register_step1_success(self):
        """Test registration step 1 - send verification code"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        assert response.status_code == 200, f"Registration step 1 failed: {response.text}"
        
        data = response.json()
        assert "verification_id" in data, "No verification_id in response"
        assert "email_code_mock" in data, "No email_code_mock in response (MOCKED)"
        assert len(data["email_code_mock"]) == 6, "Verification code should be 6 digits"
        print(f"✓ Registration step 1 successful, verification_id: {data['verification_id']}")
        print(f"✓ Email verification code (MOCKED): {data['email_code_mock']}")
    
    def test_register_step1_invalid_email_domain(self):
        """Test registration rejects non-gov.tr emails"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": "test@gmail.com",
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        assert response.status_code == 400, f"Expected 400 for non-gov.tr email, got {response.status_code}"
        print(f"✓ Registration correctly rejects non-gov.tr emails")
    
    def test_register_step1_duplicate_email(self):
        """Test registration rejects duplicate email"""
        # First registration
        response1 = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        assert response1.status_code == 200
        
        # Verify email to create user
        data1 = response1.json()
        verify_response = self.session.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={
                "verification_id": data1["verification_id"],
                "code": data1["email_code_mock"]
            }
        )
        assert verify_response.status_code == 200
        
        # Try to register again with same email
        response2 = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        assert response2.status_code == 400, f"Expected 400 for duplicate email, got {response2.status_code}"
        print(f"✓ Registration correctly rejects duplicate emails")
    
    def test_verify_email_success(self):
        """Test email verification creates user"""
        # Step 1: Register
        step1_response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "TestAd",
                "last_name": "TestSoyad"
            }
        )
        assert step1_response.status_code == 200
        step1_data = step1_response.json()
        
        # Step 2: Verify email
        verify_response = self.session.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={
                "verification_id": step1_data["verification_id"],
                "code": step1_data["email_code_mock"]
            }
        )
        assert verify_response.status_code == 200, f"Email verification failed: {verify_response.text}"
        
        verify_data = verify_response.json()
        assert "access_token" in verify_data, "No access_token in response"
        assert "user" in verify_data, "No user in response"
        assert verify_data["user"]["email"] == self.test_email
        assert verify_data["user"]["first_name"] == "TestAd"
        assert verify_data["user"]["last_name"] == "TestSoyad"
        print(f"✓ Email verification successful, user created")
        print(f"✓ User data: {verify_data['user']}")
    
    def test_verify_email_wrong_code(self):
        """Test email verification fails with wrong code"""
        # Step 1: Register
        step1_response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        assert step1_response.status_code == 200
        step1_data = step1_response.json()
        
        # Step 2: Verify with wrong code
        verify_response = self.session.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={
                "verification_id": step1_data["verification_id"],
                "code": "000000"  # Wrong code
            }
        )
        assert verify_response.status_code == 400, f"Expected 400 for wrong code, got {verify_response.status_code}"
        print(f"✓ Email verification correctly rejects wrong code")
    
    def test_resend_verification_code(self):
        """Test resend verification code"""
        # Step 1: Register
        step1_response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        assert step1_response.status_code == 200
        step1_data = step1_response.json()
        
        # Resend code
        resend_response = self.session.post(
            f"{BASE_URL}/api/auth/resend-code?verification_id={step1_data['verification_id']}"
        )
        assert resend_response.status_code == 200, f"Resend code failed: {resend_response.text}"
        
        resend_data = resend_response.json()
        assert "email_code_mock" in resend_data, "No email_code_mock in resend response"
        print(f"✓ Resend verification code successful, new code: {resend_data['email_code_mock']}")


class TestUserAccountDeletion:
    """Test user self-deletion functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.test_email = f"delete_test_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
    
    def _create_test_user(self):
        """Helper to create a test user"""
        # Register
        step1_response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "DeleteTest",
                "last_name": "User"
            }
        )
        step1_data = step1_response.json()
        
        # Verify
        verify_response = self.session.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={
                "verification_id": step1_data["verification_id"],
                "code": step1_data["email_code_mock"]
            }
        )
        verify_data = verify_response.json()
        return verify_data["access_token"], verify_data["user"]["id"]
    
    def test_user_can_delete_own_account(self):
        """Test user can delete their own account"""
        token, user_id = self._create_test_user()
        
        # Delete account
        delete_response = self.session.delete(
            f"{BASE_URL}/api/auth/delete-account",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert delete_response.status_code == 200, f"Account deletion failed: {delete_response.text}"
        
        data = delete_response.json()
        assert "message" in data
        print(f"✓ User successfully deleted own account")
        
        # Verify user can no longer access API
        me_response = self.session.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 401, f"Expected 401 after account deletion, got {me_response.status_code}"
        print(f"✓ Verified user can no longer access API after deletion")
    
    def test_delete_account_requires_auth(self):
        """Test delete account requires authentication"""
        response = self.session.delete(f"{BASE_URL}/api/auth/delete-account")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ Delete account correctly requires authentication")


class TestProfileUpdate:
    """Test profile update functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.test_email = f"profile_test_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
    
    def _create_test_user_with_profile(self):
        """Helper to create a test user with profile"""
        # Register
        step1_response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "ProfileTest",
                "last_name": "User"
            }
        )
        step1_data = step1_response.json()
        
        # Verify
        verify_response = self.session.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={
                "verification_id": step1_data["verification_id"],
                "code": step1_data["email_code_mock"]
            }
        )
        verify_data = verify_response.json()
        token = verify_data["access_token"]
        user_id = verify_data["user"]["id"]
        
        # Create profile
        profile_response = self.session.post(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "user_id": user_id,
                "display_name": "Test User",
                "institution": "ADALET BAKANLIĞI",
                "role": "Zabıt Katibi",
                "current_province": "Ankara",
                "current_district": "Çankaya",
                "bio": "Test bio"
            }
        )
        
        return token, user_id
    
    def test_profile_update_success(self):
        """Test profile update with all fields"""
        token, user_id = self._create_test_user_with_profile()
        
        # Update profile
        update_response = self.session.put(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "display_name": "Updated Name",
                "institution": "MİLLİ EĞİTİM BAKANLIĞI",
                "role": "Öğretmen",
                "current_province": "İstanbul",
                "current_district": "Kadıköy",
                "bio": "Updated bio"
            }
        )
        assert update_response.status_code == 200, f"Profile update failed: {update_response.text}"
        print(f"✓ Profile update successful")
        
        # Verify update
        get_response = self.session.get(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 200
        
        profile = get_response.json()
        assert profile["display_name"] == "Updated Name"
        assert profile["institution"] == "MİLLİ EĞİTİM BAKANLIĞI"
        assert profile["role"] == "Öğretmen"
        assert profile["current_province"] == "İstanbul"
        assert profile["current_district"] == "Kadıköy"
        assert profile["bio"] == "Updated bio"
        print(f"✓ Profile update verified: {profile}")
    
    def test_profile_partial_update(self):
        """Test profile partial update (only some fields)"""
        token, user_id = self._create_test_user_with_profile()
        
        # Update only display_name
        update_response = self.session.put(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "display_name": "Only Name Updated"
            }
        )
        assert update_response.status_code == 200, f"Partial profile update failed: {update_response.text}"
        
        # Verify update
        get_response = self.session.get(
            f"{BASE_URL}/api/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        profile = get_response.json()
        assert profile["display_name"] == "Only Name Updated"
        assert profile["institution"] == "ADALET BAKANLIĞI"  # Should remain unchanged
        print(f"✓ Partial profile update successful")


class TestAdminUserDeletion:
    """Test admin user deletion functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.test_email = f"admin_delete_test_{uuid.uuid4().hex[:8]}@adalet.gov.tr"
    
    def _get_admin_token(self):
        """Helper to get admin token"""
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        return login_response.json()["access_token"]
    
    def _create_test_user(self):
        """Helper to create a test user"""
        # Register
        step1_response = self.session.post(
            f"{BASE_URL}/api/auth/register/step1",
            json={
                "email": self.test_email,
                "password": "Test123!",
                "first_name": "AdminDeleteTest",
                "last_name": "User"
            }
        )
        step1_data = step1_response.json()
        
        # Verify
        verify_response = self.session.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={
                "verification_id": step1_data["verification_id"],
                "code": step1_data["email_code_mock"]
            }
        )
        verify_data = verify_response.json()
        return verify_data["user"]["id"]
    
    def test_admin_can_delete_user(self):
        """Test admin can delete a user"""
        # Create test user
        user_id = self._create_test_user()
        print(f"Created test user: {user_id}")
        
        # Get admin token
        admin_token = self._get_admin_token()
        
        # Delete user
        delete_response = self.session.delete(
            f"{BASE_URL}/api/admin/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200, f"Admin user deletion failed: {delete_response.text}"
        print(f"✓ Admin successfully deleted user {user_id}")
        
        # Verify user is deleted
        users_response = self.session.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = users_response.json()
        user_ids = [u["id"] for u in users]
        assert user_id not in user_ids, "User should be deleted"
        print(f"✓ Verified user {user_id} is no longer in the list")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
