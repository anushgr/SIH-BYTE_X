#!/usr/bin/env python3
"""
Test the assessment API endpoint to verify AI recommendations are working.
"""

import requests
import json

def test_assessment_api():
    """
    Test the assessment API with a simple request to verify AI recommendations work.
    """
    
    # Test data
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "dwellers": 4,
        "roofArea": 1000,
        "roofType": "concrete",
        "address": "Test Address",
        "city": "Mumbai",
        "state": "Maharashtra", 
        "currentWaterSource": "Municipal",
        "monthlyWaterBill": 500,
        "latitude": 19.0760,
        "longitude": 72.8777
    }
    
    # API endpoint
    url = "http://localhost:8000/assessment/"
    
    print("Testing assessment API endpoint...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(url, json=test_data, timeout=60)
        
        print(f"\nResponse Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Check if AI recommendations are present
            ai_recommendations = result.get("ai_recommendations", {})
            
            print(f"✓ API call successful")
            print(f"AI recommendations success: {ai_recommendations.get('success', False)}")
            
            if ai_recommendations.get('success'):
                print(f"✓ AI recommendations generated successfully!")
                print(f"Model used: {ai_recommendations.get('model_used', 'Unknown')}")
                response_text = ai_recommendations.get('raw_response', '')
                print(f"Response length: {len(response_text)} characters")
                print(f"Response preview: {response_text[:200]}...")
                return True
            else:
                print(f"✗ AI recommendations failed:")
                print(f"Error: {ai_recommendations.get('error', 'Unknown error')}")
                if ai_recommendations.get('error_details'):
                    print(f"Error details: {json.dumps(ai_recommendations['error_details'], indent=2)}")
                return False
        else:
            print(f"✗ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to the API. Make sure the backend server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"✗ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 70)
    print("Testing Assessment API - AI Recommendations Fix")
    print("=" * 70)
    
    success = test_assessment_api()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 API test passed! AI recommendations are working correctly.")
    else:
        print("❌ API test failed. Check the error messages above.")
        print("Make sure the backend server is running: uvicorn app.main:app --reload")
    print("=" * 70)