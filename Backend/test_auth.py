#!/usr/bin/env python3
"""
Test script for the authentication API
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_auth_health():
    """Test the auth health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/auth/health")
        print(f"Auth Health Check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Auth health check failed: {e}")
        return False

def test_signup():
    """Test user signup"""
    test_user = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "full_name": "Test User",
        "phone": "+91 9876543210",
        "organization": "Test Organization"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=test_user)
        print(f"Signup Test: {response.status_code}")
        if response.status_code == 200:
            print(f"User created: {response.json()}")
            return True
        else:
            print(f"Signup failed: {response.json()}")
            return False
    except Exception as e:
        print(f"Signup test failed: {e}")
        return False

def test_login():
    """Test user login"""
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login Test: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            print(f"Login successful: {token_data}")
            return token_data.get("access_token")
        else:
            print(f"Login failed: {response.json()}")
            return None
    except Exception as e:
        print(f"Login test failed: {e}")
        return None

def test_me_endpoint(token):
    """Test the /me endpoint with token"""
    if not token:
        print("No token available for /me test")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Me Endpoint Test: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"User info: {user_data}")
            return True
        else:
            print(f"/me endpoint failed: {response.json()}")
            return False
    except Exception as e:
        print(f"/me endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Authentication API")
    print("=" * 50)
    
    # Test basic health
    if not test_health():
        print("❌ Basic health check failed - server may not be running")
        exit(1)
    
    if not test_auth_health():
        print("❌ Auth health check failed")
        exit(1)
    
    print("✅ Health checks passed")
    
    # Test signup
    if test_signup():
        print("✅ Signup test passed")
    else:
        print("❌ Signup test failed")
    
    # Test login
    token = test_login()
    if token:
        print("✅ Login test passed")
    else:
        print("❌ Login test failed")
    
    # Test /me endpoint
    if test_me_endpoint(token):
        print("✅ /me endpoint test passed")
    else:
        print("❌ /me endpoint test failed")
    
    print("\nAll tests completed!")