#!/usr/bin/env python3
"""
Test script to verify the anthropic service fix for handling data type mismatches.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.anthropic_service import anthropic_service

def test_anthropic_service_with_mixed_data():
    """
    Test the anthropic service with various data types to ensure it handles edge cases properly.
    """
    
    # Mock assessment data
    assessment_data = {
        "name": "Test User",
        "address": "Test Address",
        "city": "Test City", 
        "state": "Test State",
        "dwellers": 4,
        "roof_area": 1000,
        "roof_type": "concrete",
        "currentWaterSource": "Municipal",
        "monthlyWaterBill": 500
    }
    
    # Mock rainfall data with correct structure
    rainfall_analysis = {
        "annual_rainfall_mm": 1200,
        "average_monthly_mm": 100,
        "wettest_month": {
            "name": "July",
            "rainfall_mm": 250
        },
        "driest_month": {
            "name": "December", 
            "rainfall_mm": 15
        },
        "year": 2023,
        "monthly_data": [
            {"month_name": "January", "monthly_rain_mm": 20},
            {"month_name": "February", "monthly_rain_mm": 25}
        ]
    }
    
    # Mock soil data
    soil_analysis = {
        "soil_type": "Loamy",
        "texture_class": "loamy",
        "infiltration_rate": 13,
        "suitability_score": 8,
        "rwh_suitability": "Good",
        "recommendations": "Suitable for recharge structures"
    }
    
    # Mock groundwater data
    groundwater_analysis = {
        "nearest_station": {
            "station_name": "Test Station",
            "distance_km": 5.2
        },
        "groundwater_analysis": {
            "annual_summary": {
                "avg_depth_m": 12.5
            }
        }
    }
    
    # Mock runoff analysis
    runoff_analysis = {
        "runoff_calculations": {
            "net_annual_collectible_liters": 50000,
            "average_monthly_collectible_liters": 4167,
            "collection_efficiency_percent": 80
        },
        "roof_specifications": {
            "water_quality": "good"
        },
        "first_flush_management": {
            "total_first_flush_capacity_required_liters": 2000
        }
    }
    
    # Mock feasibility assessment 
    feasibility_assessment = {
        "overall_feasibility": {
            "total_score": 78,
            "rating": "Good",
            "recommendation": "Recommended",
            "priority": "High"
        },
        "limiting_factors": ["Soil drainage", "Initial cost"]
    }
    
    # Mock structure recommendations
    structure_recommendations = {
        "strategy": "storage_focused",
        "total_estimated_cost": 75000,
        "primary_structures": [],
        "secondary_structures": [],
        "implementation_phases": []
    }
    
    print("Testing anthropic service with proper data structures...")
    
    try:
        result = anthropic_service.generate_comprehensive_recommendation(
            assessment_data=assessment_data,
            soil_analysis=soil_analysis,
            rainfall_analysis=rainfall_analysis,
            groundwater_analysis=groundwater_analysis,
            feasibility_assessment=feasibility_assessment,
            structure_recommendations=structure_recommendations,
            runoff_analysis=runoff_analysis
        )
        
        print("✓ Test passed! Result:")
        print(f"  Success: {result.get('success', False)}")
        if result.get('success'):
            print(f"  Model used: {result.get('model_used', 'Unknown')}")
            print(f"  Response length: {len(result.get('raw_response', ''))}")
        else:
            print(f"  Error: {result.get('error', 'Unknown error')}")
            if result.get('error_details'):
                print(f"  Error details: {result['error_details']}")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def test_anthropic_service_with_problematic_data():
    """
    Test the anthropic service with data that might cause the original error.
    """
    
    print("\nTesting anthropic service with potentially problematic data...")
    
    assessment_data = {
        "name": "Test User",
        "dwellers": 4,
        "roof_area": 1000,
        "roof_type": "concrete"
    }
    
    # Test with None values
    result1 = anthropic_service.generate_comprehensive_recommendation(
        assessment_data=assessment_data,
        soil_analysis=None,
        rainfall_analysis=None,
        groundwater_analysis=None,
        feasibility_assessment=None,
        structure_recommendations=None,
        runoff_analysis=None
    )
    print(f"Test with None values - Success: {result1.get('success', False)}")
    
    # Test with lists instead of dicts (this was causing the original error)
    result2 = anthropic_service.generate_comprehensive_recommendation(
        assessment_data=assessment_data,
        soil_analysis=[],  # This should be converted to None
        rainfall_analysis=[{"month": "Jan"}],  # This should be converted to None
        groundwater_analysis="invalid",  # This should be converted to None
        feasibility_assessment=123,  # This should be converted to None
        structure_recommendations=None,
        runoff_analysis=None
    )
    print(f"Test with invalid data types - Success: {result2.get('success', False)}")
    
    return result1.get('success', False) and result2.get('success', False)

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Anthropic Service Fix")
    print("=" * 60)
    
    # Test 1: Proper data structures
    test1_success = test_anthropic_service_with_mixed_data()
    
    # Test 2: Problematic data structures 
    test2_success = test_anthropic_service_with_problematic_data()
    
    print("\n" + "=" * 60)
    print("Test Results:")
    print(f"✓ Proper data test: {'PASSED' if test1_success else 'FAILED'}")
    print(f"✓ Problematic data test: {'PASSED' if test2_success else 'FAILED'}")
    
    if test1_success and test2_success:
        print("\n🎉 All tests passed! The anthropic service fix is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the error messages above.")
    
    print("=" * 60)