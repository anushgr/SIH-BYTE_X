#!/usr/bin/env python3
"""
Debug test for feasibility assessment function
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.assessment_api import calculate_detailed_feasibility

def test_with_simple_data():
    """Test with very simple, controlled data"""
    
    print("Testing feasibility with simple controlled data...")
    
    try:
        result = calculate_detailed_feasibility(
            roof_area_sqft=1000.0,
            dwellers=4,
            annual_rainfall_mm=1200.0,
            monthly_rainfall=[
                {"monthly_rain_mm": 100},
                {"monthly_rain_mm": 120},
                {"monthly_rain_mm": 80}
            ],
            soil_data={
                "success": True,
                "soil_type": "Clay",
                "suitability_score": 7
            },
            groundwater_data={
                "nearest_station": {"distance_km": 10},
                "groundwater_analysis": {
                    "annual_summary": {
                        "average_depth_mbgl": 15
                    }
                }
            },
            roof_type="concrete"
        )
        
        print("✅ SUCCESS: Feasibility calculation completed!")
        print("Score:", result["overall_feasibility"]["total_score"])
        return True
        
    except Exception as e:
        print("❌ ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return False

def test_with_empty_data():
    """Test with empty/minimal data"""
    
    print("\nTesting feasibility with empty data...")
    
    try:
        result = calculate_detailed_feasibility(
            roof_area_sqft=500.0,
            dwellers=2,
            annual_rainfall_mm=800.0,
            monthly_rainfall=[],
            soil_data={},
            groundwater_data={},
            roof_type="concrete"
        )
        
        print("✅ SUCCESS: Feasibility with empty data completed!")
        print("Score:", result["overall_feasibility"]["total_score"])
        return True
        
    except Exception as e:
        print("❌ ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return False

def test_with_problematic_data():
    """Test with data that might cause the list error"""
    
    print("\nTesting feasibility with potentially problematic data...")
    
    try:
        # Test with list instead of dict for monthly rainfall
        result = calculate_detailed_feasibility(
            roof_area_sqft=500.0,
            dwellers=2,
            annual_rainfall_mm=800.0,
            monthly_rainfall=[100, 120, 80, 90],  # Numbers instead of dicts
            soil_data={"soil_type": "Sandy"},
            groundwater_data={"status": "ok"},
            roof_type="concrete"
        )
        
        print("✅ SUCCESS: Feasibility with number list completed!")
        print("Score:", result["overall_feasibility"]["total_score"])
        return True
        
    except Exception as e:
        print("❌ ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 Debugging Feasibility Assessment Function")
    print("=" * 50)
    
    test1 = test_with_simple_data()
    test2 = test_with_empty_data() 
    test3 = test_with_problematic_data()
    
    if test1 and test2 and test3:
        print("\n🎉 All tests passed!")
    else:
        print("\n💥 Some tests failed!")