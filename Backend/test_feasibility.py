#!/usr/bin/env python3
"""
Test script for the detailed feasibility assessment
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.assessment_api import calculate_detailed_feasibility, get_roof_runoff_coefficient

def test_feasibility_assessment():
    """Test the detailed feasibility assessment function"""
    
    # Sample data for testing
    roof_area_sqft = 1000
    dwellers = 4
    annual_rainfall_mm = 1200
    monthly_rainfall = [
        {"month": "January", "monthly_rain_mm": 20},
        {"month": "February", "monthly_rain_mm": 25},
        {"month": "March", "monthly_rain_mm": 30},
        {"month": "April", "monthly_rain_mm": 40},
        {"month": "May", "monthly_rain_mm": 60},
        {"month": "June", "monthly_rain_mm": 150},
        {"month": "July", "monthly_rain_mm": 200},
        {"month": "August", "monthly_rain_mm": 180},
        {"month": "September", "monthly_rain_mm": 120},
        {"month": "October", "monthly_rain_mm": 80},
        {"month": "November", "monthly_rain_mm": 40},
        {"month": "December", "monthly_rain_mm": 25}
    ]
    
    soil_data = {
        "success": True,
        "soil_type": "Clay Loam",
        "suitability_score": 7,
        "infiltration_rate": "moderate"
    }
    
    groundwater_data = {
        "nearest_station": {
            "distance_km": 8.5,
            "station_name": "Test Station"
        },
        "groundwater_analysis": {
            "annual_summary": {
                "average_depth_mbgl": 12.5,
                "max_depth_mbgl": 15.0,
                "min_depth_mbgl": 10.0
            }
        }
    }
    
    roof_type = "concrete"
    
    print("🔍 Testing Detailed Feasibility Assessment")
    print("=" * 50)
    
    try:
        # Test the feasibility calculation
        result = calculate_detailed_feasibility(
            roof_area_sqft=roof_area_sqft,
            dwellers=dwellers,
            annual_rainfall_mm=annual_rainfall_mm,
            monthly_rainfall=monthly_rainfall,
            soil_data=soil_data,
            groundwater_data=groundwater_data,
            roof_type=roof_type
        )
        
        print("✅ Feasibility assessment completed successfully!")
        print()
        
        # Display overall results
        overall = result["overall_feasibility"]
        print(f"📊 OVERALL FEASIBILITY RESULTS")
        print(f"Total Score: {overall['total_score']}/100")
        print(f"Rating: {overall['rating']}")
        print(f"Priority: {overall['priority']}")
        print(f"Confidence: {overall['confidence_level']}")
        print(f"Recommendation: {overall['recommendation']}")
        print()
        
        # Display factor scores
        print(f"🎯 FACTOR BREAKDOWN")
        for factor, data in result["factor_scores"].items():
            print(f"{factor.replace('_', ' ').title()}: {data['score']}/100 (Weight: {data['weight']}%)")
        print()
        
        # Display recommendations
        print(f"💡 RECOMMENDATIONS")
        for i, rec in enumerate(result["recommendations"], 1):
            print(f"{i}. {rec}")
        print()
        
        # Display limiting factors
        if result["limiting_factors"]:
            print(f"⚠️  LIMITING FACTORS")
            for factor in result["limiting_factors"]:
                print(f"• {factor}")
            print()
        
        # Display implementation strategy
        strategy = result["implementation_strategy"]
        print(f"🛠️  IMPLEMENTATION STRATEGY")
        print(f"Primary Focus: {strategy['primary_focus']}")
        print(f"System Complexity: {strategy['system_complexity']}")
        print(f"Monitoring Requirements: {strategy['monitoring_requirements']}")
        print()
        
        # Test individual factor analysis
        print(f"📋 DETAILED ANALYSIS")
        
        # Rainfall analysis
        rainfall = result["detailed_analysis"]["rainfall_analysis"]
        print(f"Rainfall: {rainfall['annual_rainfall_mm']}mm/year - {rainfall['adequacy_level']}")
        print(f"Seasonal Distribution: {rainfall['seasonal_distribution']}")
        
        # Soil analysis
        soil = result["detailed_analysis"]["soil_analysis"]
        print(f"Soil: {soil['soil_type']} - {soil['recharge_potential']} potential")
        
        # Technical analysis
        technical = result["detailed_analysis"]["technical_analysis"]
        print(f"Technical: {technical['demand_fulfillment_percent']}% demand fulfillment")
        print(f"Collection: {technical['potential_annual_collection_liters']:,.0f} L/year")
        
        # Economic analysis
        economic = result["detailed_analysis"]["economic_analysis"]
        print(f"Economic: ₹{economic['estimated_system_cost_inr']:,.0f} cost, {economic['payback_period_years']} years payback")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in feasibility assessment: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_roof_coefficients():
    """Test roof coefficient calculations"""
    
    print("🏠 Testing Roof Coefficient Calculations")
    print("=" * 50)
    
    roof_types = ["concrete", "tile", "metal", "asbestos", "other"]
    
    for roof_type in roof_types:
        coeff = get_roof_runoff_coefficient(roof_type)
        print(f"{roof_type.title()}: Coefficient={coeff['coefficient']}, Efficiency={coeff['efficiency']}, Quality={coeff['quality']}")

if __name__ == "__main__":
    print("🚀 Starting Feasibility Assessment Tests")
    print()
    
    # Test roof coefficients
    test_roof_coefficients()
    print()
    
    # Test feasibility assessment
    success = test_feasibility_assessment()
    
    if success:
        print("🎉 All tests completed successfully!")
    else:
        print("💥 Tests failed!")