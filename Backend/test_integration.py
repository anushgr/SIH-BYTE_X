"""
Test script to verify the frontend-backend integration for soil data
"""

import requests
import json

# Test data that matches what the frontend sends
test_assessment_data = {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "address": "Test Address, Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "dwellers": "4",
    "roofArea": "2000",
    "roofType": "Concrete",
    "openSpace": "500",
    "currentWaterSource": "Municipal Supply",
    "monthlyWaterBill": "1500",
    "latitude": 28.61,
    "longitude": 77.20,
    "accuracy": 10.0
}

def test_assessment_creation():
    """Test the assessment creation endpoint with location data"""
    try:
        response = requests.post(
            "http://127.0.0.1:8000/assessment",
            headers={"Content-Type": "application/json"},
            json=test_assessment_data,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Assessment creation successful!")
            result = response.json()
            
            # Check if soil data is included
            if "soil_analysis" in result:
                print("✅ Soil data integration working!")
                soil_data = result["soil_analysis"]
                print(f"Soil Type: {soil_data.get('soil_type')}")
                print(f"Suitability: {soil_data.get('suitability')}")
                print(f"Suitability Score: {soil_data.get('suitability_score')}")
            else:
                print("❌ Soil data not found in response")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_soil_data_endpoint():
    """Test the dedicated soil data endpoint"""
    try:
        lat, lon = 28.61, 77.20
        response = requests.get(
            f"http://127.0.0.1:8000/assessment/soil-data/{lat}/{lon}",
            timeout=30
        )
        
        print(f"\n--- Soil Data Endpoint Test ---")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Soil data endpoint working!")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("Testing Frontend-Backend Integration for Soil Data...")
    print("=" * 50)
    
    # Test assessment creation
    test_assessment_creation()
    
    # Test dedicated soil endpoint
    test_soil_data_endpoint()
    
    print("\nTest completed!")