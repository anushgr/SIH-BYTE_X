"""
Test script to demonstrate enhanced aquifer data formatting
This simulates what the enhanced aquifer service would return
"""

def test_enhanced_aquifer_formatting():
    """
    Demonstrate the improved aquifer data formatting
    """
    
    # Simulated raw aquifer data (what might come from GeoJSON)
    raw_aquifer = {
        'NAME': 'Basement Gneissic Complex',
        'TYPE': 'Hard rock aquifer',
        'STATE': 'KA',
        'DEPTH_RANGE': '5-20',
        'YIELD_RANGE': '100-400',
        'PERMEABILITY': 'Moderate to high',
        'CONFINEMENT': 'Mostly unconfined, sometimes partly confined',
        'TRANSMISSIVITY': '2-176 m²/day',
        'STORAGE_COEFF': 'Up to 2%'
    }
    
    # Enhanced formatting (what the new service would return)
    enhanced_aquifer = {
        "basic_info": {
            "name": "Basement Gneissic Complex",
            "type": "Hard rock aquifer",
            "location": "Found in Karnataka (KA)",
            "water_storage": "Mostly unconfined (water table varies with rainfall)"
        },
        "water_characteristics": {
            "depth": {
                "category": "Shallow",
                "description": "5-20 meters - Easy to access with regular borewells",
                "raw_data": "5-20"
            },
            "yield": {
                "category": "Medium",
                "description": "100-400 m³/day - Good for villages and small towns",
                "household_equivalent": "Can supply ~125 households",
                "raw_data": "100-400"
            },
            "permeability": {
                "category": "Moderate",
                "description": "Water flows moderately well - borewells can provide steady water",
                "raw_data": "Moderate to high"
            }
        },
        "rwh_suitability": {
            "level": "Good",
            "description": "Suitable for rainwater harvesting with good potential",
            "recommendation": "Recommended for rainwater harvesting and moderate recharge"
        },
        "seasonal_notes": {
            "recharge": "Depends on monsoon rainfall for recharge",
            "reliability": "Water levels may fall during summer months",
            "maintenance": "Regular monitoring recommended for sustainable use"
        },
        "technical_details": {
            "transmissivity": "2-176 m²/day",
            "storage_coefficient": "Up to 2%",
            "hydraulic_conductivity": "Unknown",
            "porosity": "Unknown"
        }
    }
    
    print("=== ENHANCED AQUIFER DATA FORMAT ===\n")
    
    # Basic Information Card
    print("🏔️ AQUIFER PROFILE")
    print(f"Name: {enhanced_aquifer['basic_info']['name']}")
    print(f"Type: {enhanced_aquifer['basic_info']['type']}")
    print(f"Location: {enhanced_aquifer['basic_info']['location']}")
    print(f"Water Storage: {enhanced_aquifer['basic_info']['water_storage']}")
    print()
    
    # Water Characteristics
    print("💧 WATER CHARACTERISTICS")
    depth = enhanced_aquifer['water_characteristics']['depth']
    print(f"Depth: {depth['category']} - {depth['description']}")
    
    yield_info = enhanced_aquifer['water_characteristics']['yield']
    print(f"Water Availability: {yield_info['category']} - {yield_info['description']}")
    print(f"                   {yield_info['household_equivalent']}")
    
    perm = enhanced_aquifer['water_characteristics']['permeability']
    print(f"Water Flow: {perm['category']} - {perm['description']}")
    print()
    
    # RWH Suitability
    print("🌧️ RAINWATER HARVESTING SUITABILITY")
    suitability = enhanced_aquifer['rwh_suitability']
    print(f"Level: {suitability['level']}")
    print(f"Assessment: {suitability['description']}")
    print(f"Recommendation: {suitability['recommendation']}")
    print()
    
    # Seasonal Information
    print("📅 SEASONAL CONSIDERATIONS")
    seasonal = enhanced_aquifer['seasonal_notes']
    print(f"• {seasonal['recharge']}")
    print(f"• {seasonal['reliability']}")
    print(f"• {seasonal['maintenance']}")
    print()
    
    # Technical Details (expandable)
    print("🔧 TECHNICAL DETAILS (Optional)")
    technical = enhanced_aquifer['technical_details']
    print(f"Transmissivity: {technical['transmissivity']}")
    print(f"Storage Coefficient: {technical['storage_coefficient']}")
    print()
    
    print("=== COMPARISON ===\n")
    
    # Show the difference
    print("BEFORE (Raw Technical Data):")
    for key, value in raw_aquifer.items():
        print(f"  {key}: {value}")
    
    print("\nAFTER (User-Friendly Format):")
    print("  ✅ Simplified terminology")
    print("  ✅ Household equivalents for yield")
    print("  ✅ Categorized depth/yield/permeability")
    print("  ✅ RWH suitability assessment")
    print("  ✅ Seasonal considerations")
    print("  ✅ Technical details available but optional")

if __name__ == "__main__":
    test_enhanced_aquifer_formatting()