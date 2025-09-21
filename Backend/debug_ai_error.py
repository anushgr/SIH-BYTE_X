#!/usr/bin/env python3
"""
Debug script to identify the source of the 'list' object has no attribute 'get' error
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from anthropic_service import anthropic_service

def test_individual_parameters():
    """Test each parameter individually to identify the problematic one"""
    
    print("🔍 Testing individual parameters to identify the issue...")
    
    # Base assessment data (this should always work)
    assessment_data = {
        "name": "Test User",
        "email": "test@example.com",
        "roof_area": 800,
        "dwellers": 4
    }
    
    # Test scenarios with different parameter combinations
    test_cases = [
        {
            "name": "Assessment data only",
            "params": {
                "assessment_data": assessment_data
            }
        },
        {
            "name": "With soil analysis (dict)",
            "params": {
                "assessment_data": assessment_data,
                "soil_analysis": {"soil_type": "clay", "suitability_score": 7}
            }
        },
        {
            "name": "With soil analysis (list) - should be fixed",
            "params": {
                "assessment_data": assessment_data,
                "soil_analysis": ["this", "is", "a", "list"]  # This should cause error
            }
        },
        {
            "name": "With rainfall analysis (dict)",
            "params": {
                "assessment_data": assessment_data,
                "rainfall_analysis": {"annual_rainfall_mm": 1200, "year": 2024}
            }
        },
        {
            "name": "With rainfall analysis (list) - should be fixed",
            "params": {
                "assessment_data": assessment_data,
                "rainfall_analysis": ["rainfall", "data", "as", "list"]  # This should cause error
            }
        },
        {
            "name": "With feasibility assessment (dict)",
            "params": {
                "assessment_data": assessment_data,
                "feasibility_assessment": {"overall_feasibility": {"total_score": 80}}
            }
        },
        {
            "name": "With runoff analysis (dict)",
            "params": {
                "assessment_data": assessment_data,
                "runoff_analysis": {"runoff_calculations": {"net_annual_collectible_liters": 50000}}
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {test_case['name']}")
        print("-" * 50)
        
        try:
            # Only test prompt creation to avoid API calls
            service = anthropic_service
            
            # Call the prompt creation method directly
            prompt = service._create_comprehensive_prompt(**test_case['params'])
            
            print(f"✅ SUCCESS: Prompt created (length: {len(prompt)} chars)")
            
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            if "'list' object has no attribute 'get'" in str(e):
                print(f"🎯 FOUND THE ISSUE: Parameter causing error: {test_case['name']}")
            
    print("\n" + "="*60)
    print("🏁 Test completed")

if __name__ == "__main__":
    test_individual_parameters()