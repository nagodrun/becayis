"""
Test Admin Account Deletion and Listing Deletion Features
- Admin account deletion requests management
- Admin listing deletion requests management
- User account deletion request flow
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminAccountDeletionRequests:
    """Test admin account deletion request endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        assert login_response.status_code == 200, "Admin login failed"
        self.admin_token = login_response.json()["access_token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_get_account_deletion_requests(self):
        """Test admin can get account deletion requests"""
        response = self.session.get(
            f"{BASE_URL}/api/admin/account-deletion-requests",
            headers=self.admin_headers
        )
        assert response.status_code == 200, f"Failed to get account deletion requests: {response.text}"
        
        requests_list = response.json()
        assert isinstance(requests_list, list), "Response should be a list"
        print(f"✓ Admin can get account deletion requests ({len(requests_list)} requests)")
    
    def test_account_deletion_request_structure(self):
        """Test account deletion request has correct structure"""
        response = self.session.get(
            f"{BASE_URL}/api/admin/account-deletion-requests",
            headers=self.admin_headers
        )
        requests_list = response.json()
        
        if len(requests_list) > 0:
            request = requests_list[0]
            # Check required fields
            assert "id" in request, "Request should have id"
            assert "user_id" in request, "Request should have user_id"
            assert "reason" in request, "Request should have reason"
            assert "status" in request, "Request should have status"
            assert "created_at" in request, "Request should have created_at"
            print(f"✓ Account deletion request has correct structure")
        else:
            pytest.skip("No account deletion requests to test structure")
    
    def test_reject_nonexistent_account_deletion(self):
        """Test rejecting non-existent account deletion request returns 404"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/account-deletion-requests/nonexistent-id/reject",
            headers=self.admin_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Rejecting non-existent request returns 404")
    
    def test_approve_nonexistent_account_deletion(self):
        """Test approving non-existent account deletion request returns 404"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/account-deletion-requests/nonexistent-id/approve",
            headers=self.admin_headers
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Approving non-existent request returns 404")
    
    def test_clear_nonexistent_account_deletion(self):
        """Test clearing non-existent account deletion request"""
        response = self.session.delete(
            f"{BASE_URL}/api/admin/account-deletion-requests/nonexistent-id",
            headers=self.admin_headers
        )
        # Should succeed even if not found (idempotent delete)
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        print(f"✓ Clear account deletion request endpoint works")


class TestAdminListingDeletionRequests:
    """Test admin listing deletion request endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        assert login_response.status_code == 200, "Admin login failed"
        self.admin_token = login_response.json()["access_token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_get_deletion_requests(self):
        """Test admin can get listing deletion requests"""
        response = self.session.get(
            f"{BASE_URL}/api/admin/deletion-requests",
            headers=self.admin_headers
        )
        assert response.status_code == 200, f"Failed to get deletion requests: {response.text}"
        
        requests_list = response.json()
        assert isinstance(requests_list, list), "Response should be a list"
        print(f"✓ Admin can get listing deletion requests ({len(requests_list)} requests)")
    
    def test_deletion_request_structure(self):
        """Test listing deletion request has correct structure"""
        response = self.session.get(
            f"{BASE_URL}/api/admin/deletion-requests",
            headers=self.admin_headers
        )
        requests_list = response.json()
        
        if len(requests_list) > 0:
            request = requests_list[0]
            # Check required fields
            assert "id" in request, "Request should have id"
            assert "listing_id" in request, "Request should have listing_id"
            assert "user_id" in request, "Request should have user_id"
            assert "reason" in request, "Request should have reason"
            assert "status" in request, "Request should have status"
            print(f"✓ Listing deletion request has correct structure")
        else:
            pytest.skip("No listing deletion requests to test structure")
    
    def test_clear_deletion_request_endpoint(self):
        """Test clear deletion request endpoint exists"""
        response = self.session.delete(
            f"{BASE_URL}/api/admin/deletion-requests/nonexistent-id",
            headers=self.admin_headers
        )
        assert response.status_code == 404, f"Expected 404 for non-existent, got {response.status_code}"
        print(f"✓ Clear deletion request endpoint works (returns 404 for non-existent)")


class TestUserAccountDeletionFlow:
    """Test user account deletion request flow"""
    
    def test_account_deletion_status_endpoint(self):
        """Test account deletion status endpoint requires auth"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/auth/account-deletion-status")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ Account deletion status endpoint requires authentication")
    
    def test_request_account_deletion_endpoint(self):
        """Test request account deletion endpoint requires auth"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/request-account-deletion",
            json={"reason": "Test reason"}
        )
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✓ Request account deletion endpoint requires authentication")


class TestStaticPages:
    """Test static pages are accessible"""
    
    def test_terms_page(self):
        """Test /terms page is accessible"""
        response = requests.get(f"{BASE_URL}/terms")
        assert response.status_code == 200, f"Terms page failed: {response.status_code}"
        assert "text/html" in response.headers.get("content-type", "")
        print(f"✓ Terms page is accessible")
    
    def test_privacy_page(self):
        """Test /privacy page is accessible"""
        response = requests.get(f"{BASE_URL}/privacy")
        assert response.status_code == 200, f"Privacy page failed: {response.status_code}"
        assert "text/html" in response.headers.get("content-type", "")
        print(f"✓ Privacy page is accessible")
    
    def test_help_page(self):
        """Test /help page is accessible"""
        response = requests.get(f"{BASE_URL}/help")
        assert response.status_code == 200, f"Help page failed: {response.status_code}"
        assert "text/html" in response.headers.get("content-type", "")
        print(f"✓ Help page is accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
