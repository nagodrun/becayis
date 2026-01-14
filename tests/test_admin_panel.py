"""
Test Admin Panel Functionality
- Admin login
- Admin user deletion
- Admin listing deletion
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminPanel:
    """Admin panel endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.admin_token = None
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data["user"]["username"] == "becayis"
        assert data["user"]["role"] == "admin"
        
        self.admin_token = data["access_token"]
        print(f"✓ Admin login successful, token received")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong credentials"""
        response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "wrong", "password": "wrong"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Admin login correctly rejects invalid credentials")
    
    def test_admin_get_users(self):
        """Test admin can get users list"""
        # First login
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Get users
        response = self.session.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Failed to get users: {response.text}"
        
        users = response.json()
        assert isinstance(users, list), "Users should be a list"
        print(f"✓ Admin can get users list ({len(users)} users)")
        return users
    
    def test_admin_get_listings(self):
        """Test admin can get listings list"""
        # First login
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Get listings
        response = self.session.get(
            f"{BASE_URL}/api/admin/listings",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Failed to get listings: {response.text}"
        
        listings = response.json()
        assert isinstance(listings, list), "Listings should be a list"
        print(f"✓ Admin can get listings list ({len(listings)} listings)")
        return listings
    
    def test_admin_get_stats(self):
        """Test admin can get stats"""
        # First login
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Get stats
        response = self.session.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Failed to get stats: {response.text}"
        
        stats = response.json()
        assert "total_users" in stats
        assert "total_listings" in stats
        assert "active_listings" in stats
        print(f"✓ Admin can get stats: {stats}")
        return stats
    
    def test_admin_delete_user_endpoint(self):
        """Test admin user deletion endpoint exists and works"""
        # First login
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Try to delete a non-existent user (should return 404)
        response = self.session.delete(
            f"{BASE_URL}/api/admin/users/non-existent-user-id",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent user, got {response.status_code}"
        print(f"✓ Admin delete user endpoint works (returns 404 for non-existent user)")
    
    def test_admin_delete_listing_endpoint(self):
        """Test admin listing deletion endpoint exists and works"""
        # First login
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Try to delete a non-existent listing (should return 404)
        response = self.session.delete(
            f"{BASE_URL}/api/admin/listings/non-existent-listing-id",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent listing, got {response.status_code}"
        print(f"✓ Admin delete listing endpoint works (returns 404 for non-existent listing)")
    
    def test_admin_block_user_endpoint(self):
        """Test admin block user endpoint exists"""
        # First login
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Try to block a non-existent user (should return 404)
        response = self.session.put(
            f"{BASE_URL}/api/admin/users/non-existent-user-id/block",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent user, got {response.status_code}"
        print(f"✓ Admin block user endpoint works (returns 404 for non-existent user)")
    
    def test_admin_without_token_fails(self):
        """Test admin endpoints require authentication"""
        response = self.session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code in [401, 403], f"Expected 401/403 without token, got {response.status_code}"
        print(f"✓ Admin endpoints correctly require authentication")


class TestAdminDeleteRealData:
    """Test admin deletion with real data (if exists)"""
    
    def test_admin_can_delete_existing_listing(self):
        """Test admin can delete an existing listing"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = session.post(
            f"{BASE_URL}/api/admin/login",
            params={"username": "becayis", "password": "1234"}
        )
        token = login_response.json()["access_token"]
        
        # Get listings
        listings_response = session.get(
            f"{BASE_URL}/api/admin/listings",
            headers={"Authorization": f"Bearer {token}"}
        )
        listings = listings_response.json()
        
        if len(listings) == 0:
            pytest.skip("No listings to test deletion")
        
        # Get the first listing ID
        listing_id = listings[0]["id"]
        print(f"Testing deletion of listing: {listing_id}")
        
        # Delete the listing
        delete_response = session.delete(
            f"{BASE_URL}/api/admin/listings/{listing_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert delete_response.status_code == 200, f"Failed to delete listing: {delete_response.text}"
        print(f"✓ Admin successfully deleted listing {listing_id}")
        
        # Verify listing is deleted
        verify_response = session.get(
            f"{BASE_URL}/api/admin/listings",
            headers={"Authorization": f"Bearer {token}"}
        )
        remaining_listings = verify_response.json()
        listing_ids = [l["id"] for l in remaining_listings]
        assert listing_id not in listing_ids, "Listing should be deleted"
        print(f"✓ Verified listing {listing_id} is no longer in the list")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
