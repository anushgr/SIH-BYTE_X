#!/usr/bin/env python3
"""
Quick test to validate the assessment API response structure
"""

import requests
import json

def test_assessment_api():
    """Test the assessment API with sample data"""
    
    url = "http://127.0.0.1:8000/assessment/"
    
    # Sample assessment data
    test_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+91-9876543210",
        "address": "123 Test Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "dwellers": "4",
        "roofArea": "800",
        "roofType": "concrete",
        "openSpace": "200",
        "currentWaterSource": "Municipal water",
        "monthlyWaterBill": "2500",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "accuracy": 10.0
    }
    
    try:
        print("🧪 Testing Assessment API...")
        print(f"URL: {url}")
        print(f"Data: {json.dumps(test_data, indent=2)}")
        print()
        
        response = requests.post(url, json=test_data, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API Response received successfully")
            
            # Check if all expected fields are present
            assessment_data = result.get("assessment_data", {})
            print("\n📋 Assessment Data Fields:")
            print(f"  - name: {assessment_data.get('name', 'MISSING')}")
            print(f"  - email: {assessment_data.get('email', 'MISSING')}")
            print(f"  - phone: {assessment_data.get('phone', 'MISSING')}")
            print(f"  - pincode: {assessment_data.get('pincode', 'MISSING')}")
            print(f"  - current_water_source: {assessment_data.get('current_water_source', 'MISSING')}")
            print(f"  - monthly_water_bill: {assessment_data.get('monthly_water_bill', 'MISSING')}")
            
            # Check AI recommendations
            ai_recommendations = result.get("ai_recommendations")
            print(f"\n🤖 AI Recommendations:")
            if ai_recommendations:
                print(f"  - success: {ai_recommendations.get('success', 'MISSING')}")
                if ai_recommendations.get('success'):
                    print("  ✅ AI recommendations generated successfully")
                else:
                    print(f"  ❌ AI error: {ai_recommendations.get('error', 'Unknown error')}")
            else:
                print("  ❌ No AI recommendations in response")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"💥 Request failed: {str(e)}")
    except Exception as e:
        print(f"💥 Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_assessment_api()