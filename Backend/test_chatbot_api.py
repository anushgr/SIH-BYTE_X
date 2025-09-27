"""
Test script for the RAG Chatbot API
This script tests the chatbot API endpoints to ensure they work correctly.
"""

import requests
import json
import time

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_chatbot_health():
    """Test the chatbot health endpoint"""
    print("🔍 Testing chatbot health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/chatbot/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_chatbot_status():
    """Test the chatbot status endpoint"""
    print("\n🔍 Testing chatbot status endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/chatbot/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status check passed: {data}")
            return data
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return None

def test_chatbot_initialize():
    """Test the chatbot initialization endpoint"""
    print("\n🔍 Testing chatbot initialization...")
    try:
        response = requests.post(f"{BASE_URL}/api/chatbot/initialize")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Initialization started: {data}")
            return True
        else:
            print(f"❌ Initialization failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        return False

def test_chatbot_chat(message: str):
    """Test the chatbot chat endpoint"""
    print(f"\n🔍 Testing chatbot with message: '{message}'")
    try:
        payload = {
            "message": message,
            "session_id": "test_session_123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/chatbot/chat",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat response received:")
            print(f"   Success: {data.get('success')}")
            print(f"   Message: {data.get('message')}")
            print(f"   Response: {data.get('response')[:200]}...")  # First 200 chars
            return data
        else:
            print(f"❌ Chat failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return None

def main():
    """Run all tests"""
    print("🚀 Starting RAG Chatbot API Tests")
    print("=" * 50)
    
    # Test health
    if not test_chatbot_health():
        print("❌ Backend seems to be down. Please start the backend server first.")
        return
    
    # Test status
    status = test_chatbot_status()
    
    # If not initialized, initialize
    if status and not status.get('initialized'):
        print("\n📥 Chatbot not initialized. Starting initialization...")
        test_chatbot_initialize()
        
        # Wait a bit for initialization
        print("⏳ Waiting for initialization to complete...")
        time.sleep(10)
        
        # Check status again
        status = test_chatbot_status()
    
    # Test chat functionality
    test_messages = [
        "Hello, what can you tell me about rainwater harvesting?",
        "What are the main groundwater recharge structures in India?",
        "How does groundwater management work according to CGWB guidelines?",
        "What is the current status of groundwater in India?"
    ]
    
    for message in test_messages:
        response = test_chatbot_chat(message)
        if response:
            time.sleep(2)  # Small delay between requests
    
    print("\n🎉 Tests completed!")

if __name__ == "__main__":
    main()