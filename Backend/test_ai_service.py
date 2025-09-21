#!/usr/bin/env python3
"""
Test script for AI-powered rainwater harvesting recommendations
"""

import os
import sys
import asyncio
import json
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from anthropic_service import anthropic_service

async def test_ai_recommendations():
    """
    Test the AI recommendation service with sample data
    """
    print("🧪 Testing AI Rainwater Harvesting Recommendations")
    print("=" * 60)
    
    # Sample assessment data
    sample_assessment_data = {
        "name": "Test User",
        "address": "123 Test Street, Test City",
        "city": "Mumbai",
        "state": "Maharashtra",
        "roof_area": 800,  # sq ft
        "roof_type": "concrete",
        "dwellers": 4,
        "currentWaterSource": "Municipal water",
        "monthlyWaterBill": "2500"
    }
    
    # Sample soil analysis
    sample_soil_analysis = {
        "soil_type": "Clayey",
        "soil_class": "clay",
        "texture_class": "clayey",
        "suitability_score": 7,
        "infiltration_rate": "moderate",
        "rwh_suitability": "good"
    }
    
    # Sample rainfall analysis
    sample_rainfall_analysis = {
        "annual_rainfall_mm": 2200,
        "average_monthly_mm": 183,
        "wettest_month": {"name": "July", "rainfall_mm": 850},
        "driest_month": {"name": "February", "rainfall_mm": 15},
        "year": 2024
    }
    
    # Sample groundwater analysis  
    sample_groundwater_analysis = {
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
    
    # Sample feasibility assessment
    sample_feasibility_assessment = {
        "overall_feasibility": {
            "total_score": 82.5,
            "rating": "Good",
            "recommendation": "Recommended for implementation",
            "priority": "high"
        },
        "factor_scores": {
            "rainfall_adequacy": {"score": 90, "weight": 25},
            "soil_suitability": {"score": 70, "weight": 20},
            "technical_viability": {"score": 85, "weight": 20}
        }
    }
    
    # Sample runoff analysis
    sample_runoff_analysis = {
        "roof_specifications": {
            "area_sqft": 800,
            "area_sqm": 74.32,
            "roof_type": "concrete",
            "water_quality": "good"
        },
        "runoff_calculations": {
            "net_annual_collectible_liters": 95000,
            "average_monthly_collectible_liters": 7916,
            "collection_efficiency_percent": 80.0
        }
    }
    
    print("📋 Sample data prepared")
    print(f"   User: {sample_assessment_data['name']}")
    print(f"   Location: {sample_assessment_data['city']}, {sample_assessment_data['state']}")
    print(f"   Roof area: {sample_assessment_data['roof_area']} sq ft")
    print(f"   Annual rainfall: {sample_rainfall_analysis['annual_rainfall_mm']} mm")
    print()
    
    # Check if API key is configured
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("⚠️  ANTHROPIC_API_KEY not found in environment variables")
        print("   Please set your API key in the .env file to test AI recommendations")
        print("   The service will return an error response as expected")
        print()
    
    try:
        print("🤖 Calling AI recommendation service...")
        
        result = anthropic_service.generate_comprehensive_recommendation(
            assessment_data=sample_assessment_data,
            soil_analysis=sample_soil_analysis,
            rainfall_analysis=sample_rainfall_analysis,
            groundwater_analysis=sample_groundwater_analysis,
            feasibility_assessment=sample_feasibility_assessment,
            runoff_analysis=sample_runoff_analysis
        )
        
        print("📄 AI Service Response:")
        print("-" * 40)
        
        if result.get("success"):
            print("✅ SUCCESS: AI recommendations generated successfully!")
            print(f"   Model used: {result.get('model_used', 'Unknown')}")
            
            ai_recommendation = result.get("ai_recommendation", {})
            if "structured_sections" in ai_recommendation:
                print("\n📊 Structured sections found:")
                for section, content in ai_recommendation["structured_sections"].items():
                    print(f"   - {section.replace('_', ' ').title()}")
            
            # Print first 200 characters of the full response
            full_text = ai_recommendation.get("full_text", "")
            if full_text:
                print(f"\n📝 AI Response Preview:")
                print(f"   {full_text[:200]}...")
                
        else:
            print("❌ FAILED: AI recommendation generation failed")
            print(f"   Error: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"💥 EXCEPTION: {str(e)}")
        
    print("\n" + "=" * 60)
    print("🏁 Test completed")

def test_service_initialization():
    """
    Test if the service initializes correctly
    """
    print("🔧 Testing service initialization...")
    
    # Test service creation
    try:
        if anthropic_service.client is None:
            print("⚠️  Service initialized without API client (API key not configured)")
        else:
            print("✅ Service initialized successfully with API client")
    except Exception as e:
        print(f"❌ Service initialization failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting AI Recommendation Service Tests")
    print()
    
    # Test 1: Service initialization
    test_service_initialization()
    print()
    
    # Test 2: AI recommendations
    asyncio.run(test_ai_recommendations())