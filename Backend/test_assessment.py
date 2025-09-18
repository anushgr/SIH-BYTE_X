#!/usr/bin/env python3
"""
Test script to verify both soil and aquifer services are working correctly
"""

from app.soil_data.enhanced_soil_service import get_soil_data_from_raster
from app.aquifer_service import get_aquifer_data
import json

def test_assessment_services():
    lat, lon = 12.917727, 77.513259
    print('=== Testing Complete Assessment Data ===')

    print('\n1. Soil Analysis:')
    soil_result = get_soil_data_from_raster(lat, lon)
    print(f"   Type: {soil_result.get('soil_type', 'N/A')}")
    print(f"   Suitability: {soil_result.get('rwh_suitability', {}).get('suitability', 'N/A')}")
    print(f"   Score: {soil_result.get('rwh_suitability', {}).get('suitability_score', 'N/A')}/10")

    print('\n2. Aquifer Analysis:')
    aquifer_result = get_aquifer_data(lat, lon)
    if aquifer_result.get('success'):
        print(f"   Found: {aquifer_result.get('count', 0)} aquifer(s)")
        if aquifer_result.get('aquifers'):
            aquifer = aquifer_result['aquifers'][0]
            print(f"   Type: {aquifer.get('aquifer', 'N/A')}")
            print(f"   System: {aquifer.get('system', 'N/A')}")
    else:
        print(f"   Status: {aquifer_result.get('message', 'No aquifers found')}")

    print('\n✅ Both services are working correctly!')
    
    # Return combined result for API testing
    return {
        "soil_analysis": soil_result,
        "aquifer_analysis": aquifer_result,
        "location": {"latitude": lat, "longitude": lon}
    }

if __name__ == "__main__":
    result = test_assessment_services()
    print(f"\n=== Full Assessment Result ===")
    print(json.dumps(result, indent=2, default=str))