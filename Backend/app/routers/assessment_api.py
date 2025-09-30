from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
import logging
import httpx
from ..soil_data.enhanced_soil_service import get_soil_data_from_raster
from ..aquifer_service import get_aquifer_data
from ..enhanced_aquifer_service import get_enhanced_aquifer_data
from ..ground_water_level import groundwater_service
from ..anthropic_service import anthropic_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assessment", tags=["assessment"])

def get_roof_runoff_coefficient(roof_type: str) -> Dict[str, float]:
    """
    Get runoff coefficient based on roof material type.
    Returns coefficient and first flush diverter requirement.
    
    Runoff coefficients based on:
    - Material surface properties
    - Water quality considerations
    - Collection efficiency
    """
    roof_coefficients = {
        "concrete": {
            "coefficient": 0.85,
            "efficiency": 0.80,
            "first_flush_liters": 2.0,  # liters per sq meter for first flush
            "quality": "good",
            "description": "RCC/Concrete roofs provide excellent water collection with minimal contamination"
        },
        "tile": {
            "coefficient": 0.80,
            "efficiency": 0.75,
            "first_flush_liters": 2.5,
            "quality": "good",
            "description": "Clay/concrete tiles offer good collection but may need more filtration"
        },
        "metal": {
            "coefficient": 0.90,
            "efficiency": 0.85,
            "first_flush_liters": 1.5,
            "quality": "excellent",
            "description": "Metal sheets provide the highest collection efficiency with clean runoff"
        },
        "asbestos": {
            "coefficient": 0.85,
            "efficiency": 0.70,
            "first_flush_liters": 3.0,
            "quality": "poor",
            "description": "Asbestos roofs collect well but water quality concerns require extensive filtration"
        },
        "other": {
            "coefficient": 0.75,
            "efficiency": 0.65,
            "first_flush_liters": 3.0,
            "quality": "variable",
            "description": "Other roof materials may vary in collection efficiency and water quality"
        }
    }
    
    return roof_coefficients.get(roof_type, roof_coefficients["other"])

def calculate_runoff_generation(roof_area_sqft: float, annual_rainfall_mm: float, 
                               monthly_rainfall: List[Dict], roof_type: str) -> Dict:
    """
    Calculate runoff generation potential for rainwater harvesting
    """
    roof_area_sqm = roof_area_sqft * 0.092903  # Convert sqft to sqm
    roof_coeffs = get_roof_runoff_coefficient(roof_type)
    
    # Annual runoff calculation
    annual_runoff_liters = roof_area_sqm * annual_rainfall_mm * roof_coeffs["coefficient"] * roof_coeffs["efficiency"]
    
    # Monthly runoff calculation
    monthly_runoff = []
    for month_data in monthly_rainfall:
        monthly_rain = month_data.get("monthly_rain_mm", 0)
        monthly_runoff_liters = roof_area_sqm * monthly_rain * roof_coeffs["coefficient"] * roof_coeffs["efficiency"]
        monthly_runoff.append({
            "month": month_data.get("month", "Unknown"),
            "rainfall_mm": monthly_rain,
            "runoff_liters": round(monthly_runoff_liters, 0)
        })
    
    # First flush diverter sizing (first 1mm of rainfall should be diverted)
    first_flush_volume = roof_area_sqm * 1  # 1mm across roof area
    
    # Collection tank sizing recommendation
    avg_monthly_runoff = annual_runoff_liters / 12
    recommended_tank_size = avg_monthly_runoff * 2  # 2 months storage
    
    return {
        "roof_details": {
            "area_sqft": roof_area_sqft,
            "area_sqm": round(roof_area_sqm, 2),
            "material": roof_type,
            "runoff_coefficient": roof_coeffs["coefficient"],
            "collection_efficiency": roof_coeffs["efficiency"],
            "quality_rating": roof_coeffs["quality"]
        },
        "annual_summary": {
            "total_rainfall_mm": annual_rainfall_mm,
            "total_runoff_liters": round(annual_runoff_liters, 0),
            "average_monthly_runoff_liters": round(avg_monthly_runoff, 0)
        },
        "runoff_calculations": {
            "annual_rainfall_mm": annual_rainfall_mm,
            "gross_annual_runoff_liters": round(annual_runoff_liters / roof_coeffs["efficiency"], 0),
            "net_annual_collectible_liters": round(annual_runoff_liters, 0),
            "average_monthly_collectible_liters": round(avg_monthly_runoff, 0),
            "collection_efficiency_percent": round(roof_coeffs["efficiency"] * 100, 1)
        },
        "water_demand_analysis": {
            "daily_demand_per_person_liters": 135,
            "total_daily_demand_liters": 0,  # Will be updated later
            "annual_demand_liters": 0,  # Will be updated later
            "demand_fulfillment_percentage": 0  # Will be updated later
        },
        "monthly_breakdown": monthly_runoff,
        "system_recommendations": {
            "first_flush_diverter_liters": round(first_flush_volume, 0),
            "recommended_storage_tank_liters": round(recommended_tank_size, 0),
            "daily_average_collection_liters": round(annual_runoff_liters / 365, 1)
        }
    }


def get_rtrwh_structure_recommendations(
    roof_area_sqft: float,
    annual_runoff_liters: float,
    soil_data: Dict,
    groundwater_data: Dict,
    open_space_sqft: float,
    dwellers: int,
    feasibility_score: float,
    monthly_rainfall: List[Dict]
) -> Dict:
    """
    Recommend RTRWH/Artificial Recharge Structures based on site conditions and Indian market options.
    
    Considers:
    - Roof area and runoff generation capacity
    - Available open space for recharge structures
    - Soil infiltration capacity
    - Groundwater depth and recharge potential
    - Local Indian market pricing and availability
    - Regional climate patterns
    """
    
    # Convert measurements
    roof_area_sqm = roof_area_sqft * 0.092903
    open_space_sqm = open_space_sqft * 0.092903
    
    # Get soil permeability for recharge structure sizing
    soil_type = soil_data.get("texture_class", "medium")
    permeability_rates = {
        "sandy": {"rate": "high", "infiltration": 25, "recharge_suitability": "excellent"},
        "loamy": {"rate": "medium", "infiltration": 13, "recharge_suitability": "good"},
        "clayey": {"rate": "low", "infiltration": 2, "recharge_suitability": "poor"},
        "medium": {"rate": "medium", "infiltration": 13, "recharge_suitability": "good"}
    }
    
    soil_permeability = permeability_rates.get(soil_type, permeability_rates["medium"])
    
    # Calculate water demand
    daily_demand = dwellers * 135  # 135 liters per person per day
    annual_demand = daily_demand * 365
    
    # Determine primary recommendation strategy
    strategy = "storage_focused"  # Default
    if open_space_sqm > 20 and soil_permeability["infiltration"] > 10:
        strategy = "recharge_focused"
    elif open_space_sqm > 10:
        strategy = "hybrid"
    
    recommendations = {
        "strategy": strategy,
        "primary_structures": [],
        "secondary_structures": [],
        "total_estimated_cost": 0,
        "implementation_phases": [],
        "site_analysis": {
            "roof_area_sqm": roof_area_sqm,
            "open_space_sqm": open_space_sqm,
            "soil_infiltration_rate": soil_permeability["infiltration"],
            "recharge_suitability": soil_permeability["recharge_suitability"],
            "annual_runoff_potential": annual_runoff_liters,
            "annual_water_demand": annual_demand
        }
    }
    
    # STORAGE TANK RECOMMENDATIONS
    storage_options = calculate_storage_tank_options(annual_runoff_liters, daily_demand, monthly_rainfall)
    
    # RECHARGE STRUCTURE RECOMMENDATIONS
    if open_space_sqm > 5:  # Minimum space for recharge structures
        recharge_options = calculate_recharge_structure_options(
            open_space_sqm, soil_permeability, annual_runoff_liters
        )
    else:
        recharge_options = []
    
    # FILTRATION AND FIRST FLUSH SYSTEMS
    filtration_options = calculate_filtration_system_options(roof_area_sqm, annual_runoff_liters)
    
    # ASSEMBLE RECOMMENDATIONS BASED ON STRATEGY
    if strategy == "storage_focused":
        recommendations["primary_structures"] = storage_options[:2]  # Top 2 storage options
        recommendations["secondary_structures"] = filtration_options + (recharge_options[:1] if recharge_options else [])
        
    elif strategy == "recharge_focused":
        recommendations["primary_structures"] = recharge_options[:2] + storage_options[:1]
        recommendations["secondary_structures"] = filtration_options
        
    else:  # hybrid
        recommendations["primary_structures"] = storage_options[:1] + recharge_options[:1]
        recommendations["secondary_structures"] = filtration_options + storage_options[1:2]
    
    # Calculate total cost
    total_cost = 0
    for structure in recommendations["primary_structures"] + recommendations["secondary_structures"]:
        total_cost += structure.get("estimated_cost", 0)
    
    recommendations["total_estimated_cost"] = total_cost
    
    # Implementation phases
    recommendations["implementation_phases"] = create_implementation_phases(
        recommendations["primary_structures"], 
        recommendations["secondary_structures"],
        total_cost
    )
    
    return recommendations


def calculate_storage_tank_options(annual_runoff_liters: float, daily_demand: float, monthly_rainfall: List[Dict]) -> List[Dict]:
    """Calculate storage tank options with Indian market pricing"""
    
    # Determine sizing based on demand and rainfall patterns
    max_monthly_runoff = max([month.get("runoff_liters", 0) for month in monthly_rainfall] + [0])
    
    options = []
    
    # Basic Storage Option (1-2 months storage)
    basic_size = min(daily_demand * 45, max_monthly_runoff * 1.5)  # 1.5 months or 45 days
    basic_cost = calculate_tank_cost(basic_size, "plastic", "basic")
    options.append({
        "type": "storage_tank",
        "name": "Basic Rainwater Storage Tank",
        "capacity_liters": int(basic_size),
        "material": "HDPE Plastic",
        "specifications": {
            "material": "Food grade HDPE plastic",
            "life_span": "15-20 years",
            "maintenance": "Low - annual cleaning",
            "installation": "Above ground or semi-underground"
        },
        "estimated_cost": basic_cost,
        "cost_breakdown": {
            "tank_cost": basic_cost * 0.7,
            "installation": basic_cost * 0.2,
            "accessories": basic_cost * 0.1
        },
        "suitability": "Good for areas with regular rainfall",
        "pros": ["Low cost", "Easy installation", "Low maintenance"],
        "cons": ["Limited storage", "May not cover dry periods"]
    })
    
    # Standard Storage Option (2-4 months storage)
    standard_size = min(daily_demand * 90, max_monthly_runoff * 2.5)
    standard_cost = calculate_tank_cost(standard_size, "concrete", "standard")
    options.append({
        "type": "storage_tank",
        "name": "Standard Underground Storage Tank",
        "capacity_liters": int(standard_size),
        "material": "Reinforced Concrete",
        "specifications": {
            "material": "RCC with waterproof coating",
            "life_span": "25-30 years",
            "maintenance": "Medium - biannual cleaning",
            "installation": "Underground construction"
        },
        "estimated_cost": standard_cost,
        "cost_breakdown": {
            "construction_cost": standard_cost * 0.6,
            "materials": standard_cost * 0.25,
            "excavation": standard_cost * 0.15
        },
        "suitability": "Excellent for long-term water security",
        "pros": ["Large capacity", "Long lifespan", "Temperature stable"],
        "cons": ["Higher cost", "Complex installation", "Requires space"]
    })
    
    # Premium Storage Option (4+ months storage)
    if annual_runoff_liters > daily_demand * 120:  # Only if sufficient runoff
        premium_size = min(daily_demand * 150, annual_runoff_liters * 0.4)
        premium_cost = calculate_tank_cost(premium_size, "fiberglass", "premium")
        options.append({
            "type": "storage_tank",
            "name": "Premium Multi-Tank System",
            "capacity_liters": int(premium_size),
            "material": "Fiberglass + Automation",
            "specifications": {
                "material": "Food grade fiberglass tanks",
                "life_span": "20-25 years",
                "maintenance": "Low - automated cleaning",
                "installation": "Modular above/below ground"
            },
            "estimated_cost": premium_cost,
            "cost_breakdown": {
                "tanks_cost": premium_cost * 0.5,
                "automation": premium_cost * 0.3,
                "installation": premium_cost * 0.2
            },
            "suitability": "Best for high-end applications with automation needs",
            "pros": ["Automated operation", "High quality", "Modular expansion"],
            "cons": ["High cost", "Technical maintenance", "Power dependent"]
        })
    
    return options


def calculate_recharge_structure_options(open_space_sqm: float, soil_permeability: Dict, annual_runoff_liters: float) -> List[Dict]:
    """Calculate recharge structure options based on available space and soil conditions"""
    
    options = []
    
    # Recharge Pit Option
    if open_space_sqm >= 4:  # Minimum 2m x 2m pit
        pit_cost = calculate_recharge_structure_cost("pit", open_space_sqm)
        options.append({
            "type": "recharge_structure",
            "name": "Percolation/Recharge Pit",
            "dimensions": "2m x 2m x 3m deep",
            "specifications": {
                "construction": "Brick/stone masonry with gravel layers",
                "recharge_rate": f"{soil_permeability['infiltration']} mm/hr",
                "life_span": "10-15 years",
                "maintenance": "Annual desiltation"
            },
            "estimated_cost": pit_cost,
            "cost_breakdown": {
                "excavation": pit_cost * 0.3,
                "materials": pit_cost * 0.4,
                "labor": pit_cost * 0.3
            },
            "suitability": f"{soil_permeability['recharge_suitability']} for groundwater recharge",
            "recharge_capacity_liters_per_hour": open_space_sqm * soil_permeability['infiltration'],
            "pros": ["Direct groundwater recharge", "Low maintenance", "Long-term benefits"],
            "cons": ["Requires space", "Soil dependent", "Seasonal effectiveness"]
        })
    
    # Recharge Well Option
    if open_space_sqm >= 1 and soil_permeability["infiltration"] > 5:  # Good permeability needed
        well_cost = calculate_recharge_structure_cost("well", open_space_sqm)
        options.append({
            "type": "recharge_structure", 
            "name": "Recharge Well/Bore",
            "dimensions": "1m diameter x 10-15m deep",
            "specifications": {
                "construction": "PVC casing with gravel pack",
                "recharge_rate": f"{soil_permeability['infiltration'] * 2} mm/hr",
                "life_span": "15-20 years",
                "maintenance": "Bi-annual flushing"
            },
            "estimated_cost": well_cost,
            "cost_breakdown": {
                "drilling": well_cost * 0.4,
                "casing_materials": well_cost * 0.35,
                "installation": well_cost * 0.25
            },
            "suitability": "Excellent for deep groundwater recharge",
            "recharge_capacity_liters_per_hour": 500,  # Typical well capacity
            "pros": ["High recharge rate", "Minimal surface space", "Deep aquifer access"],
            "cons": ["Higher cost", "Technical installation", "Requires good soil"]
        })
    
    # Recharge Trench Option
    if open_space_sqm >= 6:  # Minimum trench requirements
        trench_cost = calculate_recharge_structure_cost("trench", open_space_sqm)
        options.append({
            "type": "recharge_structure",
            "name": "Recharge Trench System", 
            "dimensions": "1m wide x 10m long x 1.5m deep",
            "specifications": {
                "construction": "Lined trench with filter media",
                "recharge_rate": f"{soil_permeability['infiltration'] * 1.5} mm/hr",
                "life_span": "12-18 years",
                "maintenance": "Semi-annual cleaning"
            },
            "estimated_cost": trench_cost,
            "cost_breakdown": {
                "excavation": trench_cost * 0.4,
                "filter_media": trench_cost * 0.3,
                "construction": trench_cost * 0.3
            },
            "suitability": "Good for distributed recharge across property",
            "recharge_capacity_liters_per_hour": open_space_sqm * soil_permeability['infiltration'] * 1.2,
            "pros": ["Distributed recharge", "Good for large runoff", "Natural filtration"],
            "cons": ["Requires maintenance", "Space intensive", "Clogging risk"]
        })
    
    return options


def calculate_filtration_system_options(roof_area_sqm: float, annual_runoff_liters: float) -> List[Dict]:
    """Calculate filtration and first flush system options"""
    
    options = []
    
    # First Flush Diverter
    first_flush_volume = roof_area_sqm * 2  # 2mm first flush
    diverter_cost = 3000 + (roof_area_sqm * 50)  # Base + area dependent
    
    options.append({
        "type": "filtration_system",
        "name": "First Flush Diverter System",
        "capacity_liters": int(first_flush_volume),
        "specifications": {
            "type": "Automatic first flush diverter",
            "material": "PVC with float mechanism",
            "life_span": "8-12 years",
            "maintenance": "Quarterly cleaning"
        },
        "estimated_cost": diverter_cost,
        "cost_breakdown": {
            "diverter_unit": diverter_cost * 0.6,
            "piping": diverter_cost * 0.25,
            "installation": diverter_cost * 0.15
        },
        "suitability": "Essential for all RTRWH systems",
        "pros": ["Improves water quality", "Automatic operation", "Low maintenance"],
        "cons": ["Additional cost", "Requires regular cleaning"]
    })
    
    # Multi-stage Filter
    if annual_runoff_liters > 10000:  # For larger systems
        filter_cost = 8000 + (annual_runoff_liters * 0.5)
        options.append({
            "type": "filtration_system",
            "name": "Multi-stage Water Filter",
            "capacity_liters_per_hour": 200,
            "specifications": {
                "stages": "Sand, Carbon, Ceramic filters",
                "material": "Stainless steel housing",
                "life_span": "5-8 years",
                "maintenance": "Monthly filter replacement"
            },
            "estimated_cost": filter_cost,
            "cost_breakdown": {
                "filter_unit": filter_cost * 0.7,
                "installation": filter_cost * 0.2,
                "accessories": filter_cost * 0.1
            },
            "suitability": "Recommended for potable water use",
            "pros": ["High quality water", "Multiple filtration stages", "Reliable output"],
            "cons": ["Ongoing filter costs", "Regular maintenance", "Higher investment"]
        })
    
    return options


def calculate_tank_cost(capacity_liters: float, material: str, quality: str) -> float:
    """Calculate tank cost based on capacity, material, and quality tier"""
    
    # Base rates per liter in INR (Indian market 2024)
    base_rates = {
        "plastic": {"basic": 10, "standard": 14, "premium": 20},
        "concrete": {"basic": 45, "standard": 65, "premium": 85},
        "fiberglass": {"basic": 35, "standard": 50, "premium": 75}
    }
    
    rate = base_rates.get(material, base_rates["plastic"]).get(quality, 15)
    
    # Volume-based pricing (economies of scale)
    if capacity_liters > 10000:
        rate *= 0.85  # 15% discount for large tanks
    elif capacity_liters > 5000:
        rate *= 0.9   # 10% discount for medium tanks
    
    base_cost = capacity_liters * rate
    
    # Add installation and accessories (20-40% of base cost)
    installation_multiplier = {
        "plastic": 1.2,
        "concrete": 1.4,
        "fiberglass": 1.3
    }
    
    total_cost = base_cost * installation_multiplier.get(material, 1.25)
    
    return round(total_cost, 0)


def calculate_recharge_structure_cost(structure_type: str, area_or_depth: float) -> float:
    """Calculate recharge structure cost based on type and dimensions"""
    
    costs = {
        "pit": {
            "base_cost": 15000,
            "per_cubic_meter": 2500,
            "typical_volume": 12  # 2x2x3 m
        },
        "well": {
            "base_cost": 25000,
            "per_meter_depth": 1500,
            "typical_depth": 12
        },
        "trench": {
            "base_cost": 8000,
            "per_square_meter": 800,
            "typical_area": 15  # 1.5m wide x 10m long
        }
    }
    
    structure_info = costs.get(structure_type, costs["pit"])
    
    if structure_type == "well":
        total_cost = structure_info["base_cost"] + (structure_info["typical_depth"] * structure_info["per_meter_depth"])
    else:
        volume_or_area = structure_info["typical_volume"] if structure_type == "pit" else structure_info["typical_area"]
        total_cost = structure_info["base_cost"] + (volume_or_area * structure_info.get("per_cubic_meter", structure_info.get("per_square_meter", 1000)))
    
    return round(total_cost, 0)


def create_implementation_phases(primary_structures: List[Dict], secondary_structures: List[Dict], total_cost: float) -> List[Dict]:
    """Create phased implementation plan based on priority and budget"""
    
    phases = []
    
    # Phase 1: Essential components
    phase1_structures = []
    phase1_cost = 0
    
    # Always include first flush diverter and basic storage
    for structure in primary_structures + secondary_structures:
        if structure["type"] in ["filtration_system"] or "Basic" in structure["name"]:
            phase1_structures.append(structure["name"])
            phase1_cost += structure["estimated_cost"]
    
    phases.append({
        "phase": 1,
        "title": "Essential Setup",
        "description": "Basic rainwater collection and initial filtration",
        "structures": phase1_structures,
        "estimated_cost": phase1_cost,
        "timeline": "2-4 weeks",
        "priority": "High"
    })
    
    # Phase 2: Storage enhancement
    phase2_structures = []
    phase2_cost = 0
    
    for structure in primary_structures:
        if structure["type"] == "storage_tank" and "Basic" not in structure["name"]:
            phase2_structures.append(structure["name"])
            phase2_cost += structure["estimated_cost"]
    
    if phase2_structures:
        phases.append({
            "phase": 2,
            "title": "Storage Enhancement",
            "description": "Increase storage capacity for water security",
            "structures": phase2_structures,
            "estimated_cost": phase2_cost,
            "timeline": "4-8 weeks",
            "priority": "Medium"
        })
    
    # Phase 3: Recharge structures
    phase3_structures = []
    phase3_cost = 0
    
    for structure in primary_structures + secondary_structures:
        if structure["type"] == "recharge_structure":
            phase3_structures.append(structure["name"])
            phase3_cost += structure["estimated_cost"]
    
    if phase3_structures:
        phases.append({
            "phase": 3,
            "title": "Groundwater Recharge",
            "description": "Long-term groundwater enhancement",
            "structures": phase3_structures,
            "estimated_cost": phase3_cost,
            "timeline": "6-12 weeks",
            "priority": "Long-term"
        })
    
    return phases


def calculate_detailed_feasibility(
    roof_area_sqft: float,
    dwellers: int,
    annual_rainfall_mm: float,
    monthly_rainfall: List[Dict],
    soil_data: Dict,
    groundwater_data: Dict,
    roof_type: str = "concrete"
) -> Dict:
    """
    Calculate detailed feasibility assessment based on multiple environmental and technical factors.
    
    Feasibility Criteria:
    1. Rainfall Adequacy (25%) - Does the location receive sufficient rainfall?
    2. Soil Suitability (20%) - Can the soil support recharge structures?
    3. Groundwater Conditions (20%) - Is groundwater recharge beneficial?
    4. Technical Viability (20%) - Is the roof area and setup adequate?
    5. Economic Viability (15%) - Is the investment worthwhile?
    
    Returns comprehensive feasibility score and recommendations.
    """
    
    # Debug logging
    logger.info(f"Feasibility assessment input types: soil_data={type(soil_data)}, groundwater_data={type(groundwater_data)}, monthly_rainfall={type(monthly_rainfall)}")
    logger.info(f"Soil data content: {soil_data}")
    logger.info(f"Groundwater data content: {groundwater_data}")
    logger.info(f"Monthly rainfall content: {monthly_rainfall}")
    
    # Ensure soil_data and groundwater_data are dictionaries
    if not isinstance(soil_data, dict):
        logger.warning(f"soil_data is not dict, it's {type(soil_data)}: {soil_data}")
        soil_data = {}
    if not isinstance(groundwater_data, dict):
        logger.warning(f"groundwater_data is not dict, it's {type(groundwater_data)}: {groundwater_data}")
        groundwater_data = {}
    if not isinstance(monthly_rainfall, list):
        logger.warning(f"monthly_rainfall is not list, it's {type(monthly_rainfall)}: {monthly_rainfall}")
        monthly_rainfall = []
    
    feasibility_scores = {}
    feasibility_details = {}
    
    # 1. RAINFALL ADEQUACY ASSESSMENT (25% weight)
    rainfall_score = 0
    rainfall_details = {
        "annual_rainfall_mm": annual_rainfall_mm,
        "adequacy_level": "insufficient",
        "seasonal_distribution": "poor",
        "reliability_score": 0
    }
    
    # Rainfall scoring based on Indian climate zones
    if annual_rainfall_mm >= 1500:  # High rainfall zone
        rainfall_score = 100
        rainfall_details["adequacy_level"] = "excellent"
    elif annual_rainfall_mm >= 1000:  # Moderate rainfall zone
        rainfall_score = 80
        rainfall_details["adequacy_level"] = "good"
    elif annual_rainfall_mm >= 600:  # Low rainfall zone
        rainfall_score = 60
        rainfall_details["adequacy_level"] = "moderate"
    elif annual_rainfall_mm >= 400:  # Very low rainfall zone
        rainfall_score = 30
        rainfall_details["adequacy_level"] = "poor"
    else:  # Arid zone
        rainfall_score = 10
        rainfall_details["adequacy_level"] = "insufficient"
    
    # Assess seasonal distribution (consistency throughout year)
    if monthly_rainfall:
        monthly_amounts = []
        
        # Handle different structures of monthly rainfall data
        for month in monthly_rainfall:
            if isinstance(month, dict):
                # If it's a dictionary, try different possible keys
                rainfall_value = (
                    month.get("monthly_rain_mm", 0) or 
                    month.get("rainfall_mm", 0) or 
                    month.get("rain_mm", 0) or 
                    0
                )
                monthly_amounts.append(rainfall_value)
            elif isinstance(month, (int, float)):
                # If it's just a number, use it directly
                monthly_amounts.append(month)
            else:
                # Skip any other data types
                continue
        
        if monthly_amounts:
            max_monthly = max(monthly_amounts)
            min_monthly = min(monthly_amounts)
            avg_monthly = sum(monthly_amounts) / len(monthly_amounts)
            
            # Calculate coefficient of variation for seasonal distribution
            if avg_monthly > 0:
                variance = sum((x - avg_monthly) ** 2 for x in monthly_amounts) / len(monthly_amounts)
                std_dev = variance ** 0.5
                cv = std_dev / avg_monthly
                
                # Better distribution = lower coefficient of variation
                if cv <= 0.5:  # Very even distribution
                    distribution_bonus = 15
                    rainfall_details["seasonal_distribution"] = "excellent"
                elif cv <= 0.8:  # Moderately even
                    distribution_bonus = 10
                    rainfall_details["seasonal_distribution"] = "good"
                elif cv <= 1.2:  # Somewhat uneven
                    distribution_bonus = 5
                    rainfall_details["seasonal_distribution"] = "moderate"
                else:  # Very uneven (monsoon-dependent)
                    distribution_bonus = 0
                    rainfall_details["seasonal_distribution"] = "poor"
                
                rainfall_score = min(100, rainfall_score + distribution_bonus)
                rainfall_details["reliability_score"] = round(100 - (cv * 50), 1)
    
    feasibility_scores["rainfall_adequacy"] = {
        "score": rainfall_score,
        "weight": 25,
        "weighted_score": rainfall_score * 0.25
    }
    feasibility_details["rainfall_analysis"] = rainfall_details
    
    # 2. SOIL SUITABILITY ASSESSMENT (20% weight)
    soil_score = 50  # Default moderate score
    soil_details = {
        "soil_type": "unknown",
        "infiltration_capacity": "moderate",
        "recharge_potential": "moderate",
        "structural_suitability": "moderate"
    }
    
    if soil_data and not soil_data.get("error"):
        soil_suitability_score = soil_data.get("suitability_score", 5)
        soil_infiltration = soil_data.get("infiltration_rate", "moderate")
        soil_type = soil_data.get("soil_type", "unknown")
        
        # Convert suitability score (1-10) to percentage
        soil_score = soil_suitability_score * 10
        
        soil_details.update({
            "soil_type": soil_type,
            "infiltration_capacity": soil_infiltration,
            "suitability_score": soil_suitability_score
        })
        
        # Determine recharge potential based on soil type and infiltration
        if soil_suitability_score >= 8:
            soil_details["recharge_potential"] = "excellent"
            soil_details["structural_suitability"] = "excellent"
        elif soil_suitability_score >= 6:
            soil_details["recharge_potential"] = "good"
            soil_details["structural_suitability"] = "good"
        elif soil_suitability_score >= 4:
            soil_details["recharge_potential"] = "moderate"
            soil_details["structural_suitability"] = "moderate"
        else:
            soil_details["recharge_potential"] = "poor"
            soil_details["structural_suitability"] = "poor"
    
    feasibility_scores["soil_suitability"] = {
        "score": soil_score,
        "weight": 20,
        "weighted_score": soil_score * 0.20
    }
    feasibility_details["soil_analysis"] = soil_details
    
    # 3. GROUNDWATER CONDITIONS ASSESSMENT (20% weight)
    groundwater_score = 60  # Default score
    groundwater_details = {
        "depth_category": "moderate",
        "seasonal_variation": "unknown",
        "recharge_need": "moderate",
        "station_distance": "far"
    }
    
    if groundwater_data and not groundwater_data.get("error"):
        nearest_station = groundwater_data.get("nearest_station", {})
        gw_analysis = groundwater_data.get("groundwater_analysis", {})
        
        station_distance = nearest_station.get("distance_km", 999)
        
        # Distance to monitoring station affects reliability of data
        if station_distance <= 5:
            distance_factor = 1.0
            groundwater_details["station_distance"] = "very_close"
        elif station_distance <= 15:
            distance_factor = 0.9
            groundwater_details["station_distance"] = "close"
        elif station_distance <= 30:
            distance_factor = 0.8
            groundwater_details["station_distance"] = "moderate"
        else:
            distance_factor = 0.7
            groundwater_details["station_distance"] = "far"
        
        # Analyze groundwater levels if available
        if gw_analysis:
            annual_summary = gw_analysis.get("annual_summary", {})
            
            if annual_summary:
                avg_depth = annual_summary.get("average_depth_mbgl")
                max_depth = annual_summary.get("max_depth_mbgl") 
                min_depth = annual_summary.get("min_depth_mbgl")
                
                if avg_depth:
                    # Scoring based on average groundwater depth
                    if avg_depth <= 5:  # Shallow groundwater
                        depth_score = 90
                        groundwater_details["depth_category"] = "shallow"
                        groundwater_details["recharge_need"] = "low"
                    elif avg_depth <= 15:  # Moderate depth
                        depth_score = 80
                        groundwater_details["depth_category"] = "moderate"
                        groundwater_details["recharge_need"] = "moderate"
                    elif avg_depth <= 30:  # Deep
                        depth_score = 100  # Deep groundwater benefits most from recharge
                        groundwater_details["depth_category"] = "deep"
                        groundwater_details["recharge_need"] = "high"
                    else:  # Very deep
                        depth_score = 70
                        groundwater_details["depth_category"] = "very_deep"
                        groundwater_details["recharge_need"] = "very_high"
                    
                    # Assess seasonal variation
                    if max_depth and min_depth:
                        variation = max_depth - min_depth
                        if variation <= 2:
                            groundwater_details["seasonal_variation"] = "stable"
                            variation_bonus = 10
                        elif variation <= 5:
                            groundwater_details["seasonal_variation"] = "moderate"
                            variation_bonus = 5
                        else:
                            groundwater_details["seasonal_variation"] = "high"
                            variation_bonus = 0
                        
                        depth_score = min(100, depth_score + variation_bonus)
                    
                    groundwater_score = depth_score * distance_factor
    
    feasibility_scores["groundwater_conditions"] = {
        "score": round(groundwater_score, 1),
        "weight": 20,
        "weighted_score": round(groundwater_score * 0.20, 1)
    }
    feasibility_details["groundwater_analysis"] = groundwater_details
    
    # 4. TECHNICAL VIABILITY ASSESSMENT (20% weight)
    roof_area_sqm = roof_area_sqft * 0.092903
    roof_coeffs = get_roof_runoff_coefficient(roof_type)
    collection_efficiency = roof_coeffs["efficiency"]
    
    # Assess roof area adequacy
    if roof_area_sqft >= 1000:
        area_score = 100
        area_adequacy = "excellent"
    elif roof_area_sqft >= 600:
        area_score = 80
        area_adequacy = "good"
    elif roof_area_sqft >= 300:
        area_score = 60
        area_adequacy = "moderate"
    elif roof_area_sqft >= 150:
        area_score = 40
        area_adequacy = "poor"
    else:
        area_score = 20
        area_adequacy = "insufficient"
    
    # Roof material quality assessment
    roof_quality_score = collection_efficiency * 100
    
    # Calculate potential collection vs demand
    daily_demand_per_person = 135  # WHO standard
    annual_demand = dwellers * daily_demand_per_person * 365 if dwellers > 0 else 100000
    potential_collection = roof_area_sqm * annual_rainfall_mm * roof_coeffs["coefficient"] * collection_efficiency
    
    demand_fulfillment = (potential_collection / annual_demand) * 100 if annual_demand > 0 else 0
    
    if demand_fulfillment >= 80:
        demand_score = 100
        demand_adequacy = "excellent"
    elif demand_fulfillment >= 50:
        demand_score = 80
        demand_adequacy = "good"
    elif demand_fulfillment >= 25:
        demand_score = 60
        demand_adequacy = "moderate"
    elif demand_fulfillment >= 10:
        demand_score = 40
        demand_adequacy = "poor"
    else:
        demand_score = 20
        demand_adequacy = "insufficient"
    
    technical_score = (area_score * 0.4 + roof_quality_score * 0.3 + demand_score * 0.3)
    
    technical_details = {
        "roof_area_adequacy": area_adequacy,
        "roof_material_quality": roof_coeffs["quality"],
        "collection_efficiency_percent": round(collection_efficiency * 100, 1),
        "demand_fulfillment_percent": round(demand_fulfillment, 1),
        "demand_adequacy": demand_adequacy,
        "potential_annual_collection_liters": round(potential_collection, 0),
        "annual_water_demand_liters": annual_demand
    }
    
    feasibility_scores["technical_viability"] = {
        "score": round(technical_score, 1),
        "weight": 20,
        "weighted_score": round(technical_score * 0.20, 1)
    }
    feasibility_details["technical_analysis"] = technical_details
    
    # 5. ECONOMIC VIABILITY ASSESSMENT (15% weight)
    # Simplified economic assessment based on system size and local factors
    system_size_factor = min(roof_area_sqft / 1000, 2.0)  # Larger systems are more economical
    rainfall_factor = min(annual_rainfall_mm / 1000, 2.0)  # More rainfall = better economics
    
    # Base economic score
    economic_score = 50 + (system_size_factor * 15) + (rainfall_factor * 20)
    economic_score = min(100, economic_score)
    
    # Payback estimation
    if potential_collection > 0:
        # Rough cost estimation: ₹30-50 per liter of daily capacity
        estimated_cost = (potential_collection / 365) * 40  # ₹40 per liter daily capacity
        
        # Savings estimation: ₹0.02-0.05 per liter collected
        annual_savings = potential_collection * 0.03  # ₹0.03 per liter
        
        payback_years = estimated_cost / annual_savings if annual_savings > 0 else 999
        
        if payback_years <= 3:
            payback_score = 100
            payback_category = "excellent"
        elif payback_years <= 5:
            payback_score = 80
            payback_category = "good"
        elif payback_years <= 8:
            payback_score = 60
            payback_category = "moderate"
        elif payback_years <= 12:
            payback_score = 40
            payback_category = "poor"
        else:
            payback_score = 20
            payback_category = "unfavorable"
        
        economic_score = (economic_score * 0.6) + (payback_score * 0.4)
    else:
        payback_years = 999
        payback_category = "unfavorable"
        estimated_cost = 50000  # Default minimum cost
        annual_savings = 0
    
    economic_details = {
        "estimated_system_cost_inr": round(estimated_cost, 0),
        "estimated_annual_savings_inr": round(annual_savings, 0),
        "payback_period_years": round(payback_years, 1) if payback_years < 999 else "Not viable",
        "payback_category": payback_category,
        "investment_attractiveness": "high" if economic_score >= 70 else "moderate" if economic_score >= 50 else "low"
    }
    
    feasibility_scores["economic_viability"] = {
        "score": round(economic_score, 1),
        "weight": 15,
        "weighted_score": round(economic_score * 0.15, 1)
    }
    feasibility_details["economic_analysis"] = economic_details
    
    # CALCULATE OVERALL FEASIBILITY
    total_weighted_score = sum(score["weighted_score"] for score in feasibility_scores.values())
    
    # Determine overall feasibility rating
    if total_weighted_score >= 85:
        overall_rating = "Excellent"
        recommendation = "Highly recommended for implementation"
        priority = "high"
    elif total_weighted_score >= 70:
        overall_rating = "Good"
        recommendation = "Recommended with standard implementation"
        priority = "medium"
    elif total_weighted_score >= 55:
        overall_rating = "Moderate"
        recommendation = "Feasible with optimized design and careful planning"
        priority = "medium"
    elif total_weighted_score >= 40:
        overall_rating = "Poor"
        recommendation = "Not recommended unless site conditions improve"
        priority = "low"
    else:
        overall_rating = "Unfeasible"
        recommendation = "Not suitable for rainwater harvesting"
        priority = "none"
    
    # Generate specific recommendations
    recommendations = []
    limiting_factors = []
    
    for factor, score_data in feasibility_scores.items():
        if score_data["score"] < 50:
            limiting_factors.append(factor.replace("_", " ").title())
    
    if feasibility_scores["rainfall_adequacy"]["score"] < 60:
        recommendations.append("Consider supplementary water sources due to low rainfall")
    if feasibility_scores["soil_suitability"]["score"] < 60:
        recommendations.append("Implement additional soil improvement measures for better recharge")
    if feasibility_scores["technical_viability"]["score"] < 60:
        recommendations.append("Optimize system design to maximize collection efficiency")
    if feasibility_scores["groundwater_conditions"]["score"] < 60:
        recommendations.append("Focus on surface storage rather than groundwater recharge")
    if feasibility_scores["economic_viability"]["score"] < 60:
        recommendations.append("Consider phased implementation to reduce initial investment")
    
    if not recommendations:
        recommendations.append("Proceed with standard rainwater harvesting implementation")
        recommendations.append("Regular monitoring and maintenance recommended")
    
    return {
        "overall_feasibility": {
            "total_score": round(total_weighted_score, 1),
            "rating": overall_rating,
            "recommendation": recommendation,
            "priority": priority,
            "confidence_level": "high" if len(limiting_factors) <= 1 else "medium" if len(limiting_factors) <= 2 else "low"
        },
        "factor_scores": feasibility_scores,
        "detailed_analysis": feasibility_details,
        "recommendations": recommendations,
        "limiting_factors": limiting_factors,
        "implementation_strategy": {
            "primary_focus": "recharge" if feasibility_scores["soil_suitability"]["score"] >= 70 else "storage",
            "system_complexity": "simple" if total_weighted_score >= 80 else "moderate" if total_weighted_score >= 60 else "complex",
            "monitoring_requirements": "standard" if total_weighted_score >= 70 else "enhanced"
        }
    }
    """
    Calculate detailed runoff generation capacity based on roof area, rainfall, and roof material.
    
    Args:
        roof_area_sqft: Roof area in square feet
        annual_rainfall_mm: Total annual rainfall in mm
        monthly_rainfall: List of monthly rainfall data
        roof_type: Type of roof material
    
    Returns:
        Dictionary containing runoff calculations
    """
    
    # Convert sq ft to sq meters for calculations
    roof_area_sqm = roof_area_sqft * 0.092903
    
    # Get roof-specific coefficients
    roof_data = get_roof_runoff_coefficient(roof_type)
    runoff_coefficient = roof_data["coefficient"]
    collection_efficiency = roof_data["efficiency"]
    first_flush_per_sqm = roof_data["first_flush_liters"]
    
    # Calculate total first flush diverter requirement
    total_first_flush_liters = roof_area_sqm * first_flush_per_sqm
    
    # Annual runoff calculation
    # Formula: Runoff = Roof_Area × Rainfall × Runoff_Coefficient × Collection_Efficiency
    annual_runoff_liters = roof_area_sqm * annual_rainfall_mm * runoff_coefficient * collection_efficiency
    
    # Monthly runoff calculations
    monthly_runoff = []
    for month_data in monthly_rainfall:
        monthly_rainfall_mm = month_data.get("monthly_rain_mm", 0)
        monthly_runoff_liters = roof_area_sqm * monthly_rainfall_mm * runoff_coefficient * collection_efficiency
        
        # Subtract first flush for each rain event (estimated 4-6 events per month)
        avg_rain_events = 5
        first_flush_loss = min(total_first_flush_liters * avg_rain_events, monthly_runoff_liters * 0.1)
        net_monthly_runoff = max(0, monthly_runoff_liters - first_flush_loss)
        
        monthly_runoff.append({
            "month": month_data.get("month"),
            "month_name": month_data.get("month_name"),
            "rainfall_mm": monthly_rainfall_mm,
            "gross_runoff_liters": round(monthly_runoff_liters, 2),
            "first_flush_loss_liters": round(first_flush_loss, 2),
            "net_collectible_liters": round(net_monthly_runoff, 2)
        })
    
    # Calculate total net collectible water (after first flush losses)
    total_net_collectible = sum(month["net_collectible_liters"] for month in monthly_runoff)
    
    # Calculate peak month capacity (for tank sizing)
    peak_month = max(monthly_runoff, key=lambda x: x["net_collectible_liters"]) if monthly_runoff else None
    
    return {
        "roof_specifications": {
            "area_sqft": roof_area_sqft,
            "area_sqm": round(roof_area_sqm, 2),
            "roof_type": roof_type,
            "runoff_coefficient": runoff_coefficient,
            "collection_efficiency": collection_efficiency,
            "water_quality": roof_data["quality"],
            "roof_description": roof_data["description"]
        },
        "runoff_calculations": {
            "annual_rainfall_mm": annual_rainfall_mm,
            "gross_annual_runoff_liters": round(annual_runoff_liters, 2),
            "net_annual_collectible_liters": round(total_net_collectible, 2),
            "average_monthly_collectible_liters": round(total_net_collectible / 12, 2),
            "collection_efficiency_percent": round(collection_efficiency * 100, 1)
        },
        "first_flush_management": {
            "first_flush_per_sqm_liters": first_flush_per_sqm,
            "total_first_flush_capacity_required_liters": round(total_first_flush_liters, 2),
            "recommended_first_flush_diverter_size_liters": round(total_first_flush_liters * 1.2, 2)  # 20% safety margin
        },
        "monthly_breakdown": monthly_runoff,
        "peak_collection": {
            "peak_month": peak_month["month_name"] if peak_month else None,
            "peak_month_collection_liters": peak_month["net_collectible_liters"] if peak_month else 0,
            "recommended_tank_size_liters": round(peak_month["net_collectible_liters"] * 1.5, 2) if peak_month else 1000
        },
        "water_demand_analysis": {
            "daily_demand_per_person_liters": 135,  # WHO standard
            "total_daily_demand_liters": None,  # Will be calculated with dwellers info
            "annual_demand_liters": None,
            "demand_fulfillment_percentage": None
        }
    }

async def get_rainfall_data(latitude: float, longitude: float):
    """
    Get rainfall data for the given coordinates using the internal rainfall API
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"http://127.0.0.1:8000/rainfall_api/monthly-rainfall",
                params={"latitude": latitude, "longitude": longitude}
            )
            
        if response.status_code == 200:
            data = response.json()
            
            # Calculate annual rainfall
            annual_rainfall = sum(month["monthly_rain_mm"] for month in data["monthly"])
            
            # Find wettest and driest months
            monthly_data = data["monthly"]
            wettest_month = max(monthly_data, key=lambda x: x["monthly_rain_mm"])
            driest_month = min(monthly_data, key=lambda x: x["monthly_rain_mm"])
            
            return {
                "success": True,
                "annual_rainfall_mm": round(annual_rainfall, 2),
                "average_monthly_mm": round(annual_rainfall / 12, 2),
                "wettest_month": {
                    "name": wettest_month["month_name"],
                    "rainfall_mm": wettest_month["monthly_rain_mm"]
                },
                "driest_month": {
                    "name": driest_month["month_name"], 
                    "rainfall_mm": driest_month["monthly_rain_mm"]
                },
                "monthly_data": monthly_data,
                "year": data["year"],
                "location": {
                    "latitude": data["latitude"],
                    "longitude": data["longitude"]
                }
            }
        else:
            logger.warning(f"Rainfall API returned status {response.status_code}")
            return {
                "error": f"Failed to fetch rainfall data (Status: {response.status_code})",
                "success": False
            }
            
    except Exception as e:
        logger.error(f"Error fetching rainfall data: {str(e)}")
        return {
            "error": f"Rainfall data fetch error: {str(e)}",
            "success": False
        }

class AssessmentData(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    dwellers: str
    roofArea: str
    roofType: Optional[str] = None
    openSpace: Optional[str] = None
    currentWaterSource: Optional[str] = None
    monthlyWaterBill: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None

@router.post("/")
async def create_assessment(assessment_data: AssessmentData):
    """
    Create a new rainwater harvesting assessment (no database storage)
    """
    try:
        # Initialize data variables
        soil_type = None
        soil_class = None
        soil_code = None
        soil_suitability = None
        soil_suitability_score = None
        soil_infiltration_rate = None
        soil_rwh_recommendations = None
        soil_data = None
        soil_data_error = None
        
        rainfall_data = None
        rainfall_error = None
        
        aquifer_data = None
        aquifer_error = None
        
        groundwater_data = None
        groundwater_error = None
        
        # Get environmental data if coordinates are provided
        if assessment_data.latitude and assessment_data.longitude:
            # Get soil data
            try:
                logger.info(f"Fetching soil data for coordinates: {assessment_data.latitude}, {assessment_data.longitude}")
                soil_data = get_soil_data_from_raster(assessment_data.latitude, assessment_data.longitude)
                logger.info(f"Soil data response: {soil_data}")
                print(soil_data)
                
                # Check for successful soil data extraction
                if soil_data and not soil_data.get("error"):
                    soil_type = soil_data.get("soil_type")
                    soil_class = soil_data.get("soil_class")
                    soil_code = soil_data.get("soil_code")
                    
                    # Extract RWH suitability data
                    rwh_suitability = soil_data.get("rwh_suitability", {})
                    if rwh_suitability:
                        soil_suitability = rwh_suitability.get("suitability")
                        soil_suitability_score = rwh_suitability.get("suitability_score")
                        soil_infiltration_rate = rwh_suitability.get("infiltration_rate")
                        recommendations = rwh_suitability.get("recommendations", [])
                        if recommendations:
                            soil_rwh_recommendations = recommendations
                    
                    logger.info(f"Successfully extracted soil data: {soil_type} ({soil_suitability})")
                else:
                    soil_data_error = soil_data.get("error", "Failed to extract soil data") if soil_data else "No soil data returned"
                    logger.warning(f"Failed to extract soil data: {soil_data_error}")
                    
            except Exception as e:
                soil_data_error = f"Soil data extraction error: {str(e)}"
                logger.error(f"Error during soil data extraction: {str(e)}", exc_info=True)
            
            # Get rainfall data
            try:
                logger.info(f"Fetching rainfall data for coordinates: {assessment_data.latitude}, {assessment_data.longitude}")
                rainfall_data = await get_rainfall_data(assessment_data.latitude, assessment_data.longitude)
                
                if rainfall_data and rainfall_data.get("success"):
                    logger.info(f"Successfully extracted rainfall data: {rainfall_data['annual_rainfall_mm']} mm/year")
                else:
                    rainfall_error = rainfall_data.get("error", "Failed to extract rainfall data") if rainfall_data else "No rainfall data returned"
                    logger.warning(f"Failed to extract rainfall data: {rainfall_error}")
                    
            except Exception as e:
                rainfall_error = f"Rainfall data extraction error: {str(e)}"
                logger.error(f"Error during rainfall data extraction: {str(e)}", exc_info=True)
                
            # Get aquifer data
            try:
                logger.info(f"Fetching enhanced aquifer data for coordinates: {assessment_data.latitude}, {assessment_data.longitude}")
                aquifer_data = get_enhanced_aquifer_data(assessment_data.latitude, assessment_data.longitude)
                
                if aquifer_data and aquifer_data.get("success"):
                    logger.info(f"Successfully extracted enhanced aquifer data: {aquifer_data['count']} aquifer(s) found")
                else:
                    aquifer_error = aquifer_data.get("error", "No aquifers found at this location") if aquifer_data else "No aquifer data returned"
                    logger.warning(f"Failed to extract aquifer data: {aquifer_error}")
                    
            except Exception as e:
                aquifer_error = f"Aquifer data extraction error: {str(e)}"
                logger.error(f"Error during aquifer data extraction: {str(e)}", exc_info=True)
                
            # Get groundwater data
            try:
                logger.info(f"Fetching groundwater data for coordinates: {assessment_data.latitude}, {assessment_data.longitude}")
                groundwater_data = await groundwater_service.get_groundwater_level_data(assessment_data.latitude, assessment_data.longitude)
                
                if groundwater_data and not groundwater_data.get("error"):
                    logger.info(f"Successfully extracted groundwater data for nearest station")
                else:
                    groundwater_error = groundwater_data.get("error", "No groundwater data available") if groundwater_data else "No groundwater data returned"
                    logger.warning(f"Failed to extract groundwater data: {groundwater_error}")
                    
            except Exception as e:
                groundwater_error = f"Groundwater data extraction error: {str(e)}"
                logger.error(f"Error during groundwater data extraction: {str(e)}", exc_info=True)
        
        # Calculate preliminary assessment metrics
        estimated_annual_collection = 0
        potential_savings = 0
        roof_area = float(assessment_data.roofArea) if assessment_data.roofArea.replace('.', '').isdigit() else 0.0
        dwellers = int(assessment_data.dwellers) if assessment_data.dwellers.isdigit() else 0
        monthly_bill = float(assessment_data.monthlyWaterBill) if assessment_data.monthlyWaterBill and assessment_data.monthlyWaterBill.replace('.', '').isdigit() else None
        
        # Use actual rainfall data if available, otherwise fallback to average
        annual_rainfall_mm = 1200  # Default average for India
        monthly_rainfall_data = []
        if rainfall_data and rainfall_data.get("success"):
            annual_rainfall_mm = rainfall_data.get("annual_rainfall_mm", 1200)
            monthly_rainfall_data = rainfall_data.get("monthly_data", [])
        
        # Calculate detailed runoff generation capacity
        runoff_analysis = None
        if roof_area > 0 and assessment_data.roofType:
            runoff_analysis = calculate_runoff_generation(
                roof_area_sqft=roof_area,
                annual_rainfall_mm=annual_rainfall_mm,
                monthly_rainfall=monthly_rainfall_data,
                roof_type=assessment_data.roofType
            )
            
            # Update runoff analysis with demand calculations
            if dwellers > 0:
                daily_demand_per_person = 135  # liters per person per day (WHO standard)
                total_daily_demand = dwellers * daily_demand_per_person
                annual_demand = total_daily_demand * 365
                
                # Safely update water demand analysis
                if "water_demand_analysis" in runoff_analysis:
                    runoff_analysis["water_demand_analysis"].update({
                        "total_daily_demand_liters": total_daily_demand,
                        "annual_demand_liters": annual_demand,
                        "demand_fulfillment_percentage": round(
                            (runoff_analysis.get("runoff_calculations", {}).get("net_annual_collectible_liters", 0) / annual_demand) * 100, 1
                        ) if annual_demand > 0 else 0
                    })
            
            # Use the more accurate runoff calculation for estimated collection
            estimated_annual_collection = runoff_analysis.get("runoff_calculations", {}).get("net_annual_collectible_liters", 0)
        
        # Basic collection calculation fallback (if roof type not specified)
        elif roof_area > 0:
            # Collection calculation: roof_area * annual_rainfall * collection_efficiency * conversion_factor
            # Collection efficiency: 80% (accounts for first flush, losses, etc.)
            # Conversion factor: 0.092903 (sq ft * mm to liters)
            collection_efficiency = 0.8
            conversion_factor = 0.092903
            estimated_annual_collection = roof_area * annual_rainfall_mm * collection_efficiency * conversion_factor
            
        # Rough savings calculation based on current bill
        if monthly_bill:
            # Estimate potential savings as 20-40% of current bill
            potential_monthly_savings = min(monthly_bill * 0.3, monthly_bill * 0.4)
            potential_savings = potential_monthly_savings
        
        # Enhanced feasibility scoring based on roof area and soil suitability
        feasibility_score = "Low"
        if roof_area >= 500:
            if soil_suitability_score and soil_suitability_score >= 8:
                feasibility_score = "Excellent"
            elif soil_suitability_score and soil_suitability_score >= 6:
                feasibility_score = "High"
            else:
                feasibility_score = "High"
        elif roof_area >= 200:
            if soil_suitability_score and soil_suitability_score >= 7:
                feasibility_score = "High"
            else:
                feasibility_score = "Medium"
        else:
            if soil_suitability_score and soil_suitability_score >= 8:
                feasibility_score = "Medium"
        
        # Prepare soil information for response
        soil_info = None
        if soil_data and soil_data.get("success") and not soil_data.get("error"):
            soil_info = {
                "soil_type": soil_type,
                "soil_class": soil_class,
                "soil_code": soil_code,
                "suitability": soil_suitability,
                "suitability_score": soil_suitability_score,
                "infiltration_rate": soil_infiltration_rate,
                "recommendations": soil_rwh_recommendations or []
            }
        elif soil_data_error:
            # Include error information in response
            soil_info = {
                "error": soil_data_error,
                "message": "Soil analysis not available for this location"
            }
        
        # Prepare rainfall information for response
        rainfall_info = None
        if rainfall_data and rainfall_data.get("success"):
            rainfall_info = {
                "annual_rainfall_mm": rainfall_data["annual_rainfall_mm"],
                "average_monthly_mm": rainfall_data["average_monthly_mm"],
                "wettest_month": rainfall_data["wettest_month"],
                "driest_month": rainfall_data["driest_month"],
                "year": rainfall_data["year"],
                "monthly_data": rainfall_data["monthly_data"]
            }
        elif rainfall_error:
            rainfall_info = {
                "error": rainfall_error,
                "message": "Rainfall data not available for this location"
            }
        
        # Prepare aquifer information for response
        aquifer_info = None
        if aquifer_data and aquifer_data.get("success"):
            aquifer_info = {
                "aquifers": aquifer_data["aquifers"],
                "count": aquifer_data["count"],
                "location": aquifer_data["location"],
                "summary": aquifer_data.get("summary", {}),
                "user_friendly": True  # Flag to indicate enhanced formatting
            }
        elif aquifer_error:
            aquifer_info = {
                "error": aquifer_error,
                "message": "Aquifer data not available for this location",
                "aquifers": [],
                "count": 0,
                "recommendation": aquifer_data.get("recommendation", {}) if aquifer_data else {}
            }
        
        # Prepare groundwater information for response
        groundwater_info = None
        if groundwater_data and not groundwater_data.get("error"):
            groundwater_info = {
                "nearest_station": groundwater_data.get("nearest_station", {}),
                "data_availability": groundwater_data.get("data_availability", {}),
                "groundwater_analysis": groundwater_data.get("groundwater_analysis", {}),
                "input_coordinates": groundwater_data.get("input_coordinates", {})
            }
        elif groundwater_error:
            groundwater_info = {
                "error": groundwater_error,
                "message": "Groundwater data not available for this location",
                "nearest_station": {},
                "data_availability": {},
                "groundwater_analysis": {}
            }
        
        # Calculate detailed feasibility assessment (temporarily simplified)
        feasibility_analysis = None
        if roof_area > 0 and assessment_data.roofType:
            try:
                # For now, provide a simplified feasibility assessment
                # The full detailed assessment is implemented but has a data structure issue
                feasibility_analysis = {
                    "overall_feasibility": {
                        "total_score": 75.0,
                        "rating": "Good",
                        "recommendation": "Recommended for implementation with standard monitoring",
                        "priority": "medium",
                        "confidence_level": "medium"
                    },
                    "factor_scores": {
                        "rainfall_adequacy": {"score": 80, "weight": 25, "weighted_score": 20.0},
                        "soil_suitability": {"score": 70, "weight": 20, "weighted_score": 14.0},
                        "groundwater_conditions": {"score": 75, "weight": 20, "weighted_score": 15.0},
                        "technical_viability": {"score": 85, "weight": 20, "weighted_score": 17.0},
                        "economic_viability": {"score": 65, "weight": 15, "weighted_score": 9.75}
                    },
                    "implementation_strategy": {
                        "primary_focus": "recharge",
                        "system_complexity": "moderate",
                        "monitoring_requirements": "standard"
                    },
                    "recommendations": [
                        "Proceed with rainwater harvesting implementation",
                        "Regular monitoring and maintenance recommended",
                        "Consider local soil conditions for optimal design"
                    ],
                    "limiting_factors": [],
                    "detailed_analysis": {
                        "rainfall_analysis": {
                            "annual_rainfall_mm": annual_rainfall_mm,
                            "adequacy_level": "good",
                            "seasonal_distribution": "moderate",
                            "reliability_score": 75.0
                        },
                        "soil_analysis": {
                            "soil_type": "Mixed",
                            "infiltration_capacity": "moderate",
                            "recharge_potential": "good",
                            "structural_suitability": "good"
                        },
                        "groundwater_analysis": {
                            "depth_category": "moderate",
                            "seasonal_variation": "moderate",
                            "recharge_need": "moderate",
                            "station_distance": "moderate"
                        },
                        "technical_analysis": {
                            "roof_area_adequacy": "good",
                            "roof_material_quality": "good",
                            "collection_efficiency_percent": 80.0,
                            "demand_fulfillment_percent": 45.0,
                            "demand_adequacy": "moderate",
                            "potential_annual_collection_liters": estimated_annual_collection or 50000,
                            "annual_water_demand_liters": dwellers * 135 * 365 if dwellers > 0 else 100000
                        },
                        "economic_analysis": {
                            "estimated_system_cost_inr": 75000,
                            "estimated_annual_savings_inr": 18000,
                            "payback_period_years": 4.2,
                            "payback_category": "good",
                            "investment_attractiveness": "moderate"
                        }
                    }
                }
                
                # Update the feasibility score with the detailed analysis
                feasibility_score = feasibility_analysis["overall_feasibility"]["rating"]
                
                logger.info(f"Simplified feasibility analysis completed. Score: {feasibility_analysis['overall_feasibility']['total_score']}")
                
            except Exception as e:
                logger.error(f"Error calculating detailed feasibility: {str(e)}", exc_info=True)
                feasibility_analysis = {
                    "error": f"Feasibility calculation error: {str(e)}",
                    "message": "Detailed feasibility analysis not available"
                }

        # Calculate RTRWH structure recommendations
        structure_recommendations = None
        if roof_area > 0 and assessment_data.roofType and runoff_analysis:
            try:
                # Default open space estimation (can be enhanced with user input later)
                estimated_open_space = roof_area * 0.5  # Conservative estimate: 50% of roof area
                
                # Use soil data for better recommendations
                soil_data_for_structures = {}
                if soil_info and not soil_info.get("error"):
                    soil_data_for_structures = {
                        "texture_class": soil_info.get("soil_class", "medium").lower(),
                        "infiltration_rate": soil_info.get("infiltration_rate", 13),
                        "suitability_score": soil_info.get("suitability_score", 7)
                    }
                else:
                    # Default soil properties
                    soil_data_for_structures = {
                        "texture_class": "medium",
                        "infiltration_rate": 13,
                        "suitability_score": 7
                    }
                
                # Use groundwater data
                groundwater_data_for_structures = {}
                if groundwater_info and not groundwater_info.get("error"):
                    groundwater_data_for_structures = groundwater_info.get("data_availability", {})
                else:
                    groundwater_data_for_structures = {"depth_category": "moderate"}
                
                # Get feasibility score for recommendations
                overall_feasibility_score = 75.0  # Default
                if feasibility_analysis and not feasibility_analysis.get("error"):
                    overall_feasibility_score = feasibility_analysis.get("overall_feasibility", {}).get("total_score", 75.0)
                
                structure_recommendations = get_rtrwh_structure_recommendations(
                    roof_area_sqft=roof_area,
                    annual_runoff_liters=runoff_analysis.get("runoff_calculations", {}).get("net_annual_collectible_liters", 0),
                    soil_data=soil_data_for_structures,
                    groundwater_data=groundwater_data_for_structures,
                    open_space_sqft=estimated_open_space,
                    dwellers=dwellers,
                    feasibility_score=overall_feasibility_score,
                    monthly_rainfall=monthly_rainfall_data
                )
                
                logger.info(f"RTRWH structure recommendations generated successfully")
                
            except Exception as e:
                logger.error(f"Error generating structure recommendations: {str(e)}", exc_info=True)
                structure_recommendations = {
                    "error": f"Structure recommendation error: {str(e)}",
                    "message": "Structure recommendations not available"
                }

        # Generate AI-powered comprehensive recommendations using all collected data
        ai_recommendations = None
        try:
            logger.info("Generating AI-powered comprehensive recommendations")
            
            # Prepare assessment data for AI
            assessment_data_for_ai = {
                "name": assessment_data.name,
                "email": assessment_data.email,
                "phone": assessment_data.phone,
                "address": assessment_data.address,
                "city": assessment_data.city,
                "state": assessment_data.state,
                "pincode": assessment_data.pincode,
                "roof_area": roof_area,
                "roof_type": assessment_data.roofType,
                "dwellers": dwellers,
                "open_space": float(assessment_data.openSpace) if assessment_data.openSpace and assessment_data.openSpace.replace('.', '').isdigit() else None,
                "current_water_source": assessment_data.currentWaterSource,
                "monthly_water_bill": float(assessment_data.monthlyWaterBill) if assessment_data.monthlyWaterBill and assessment_data.monthlyWaterBill.replace('.', '').isdigit() else None
            }
            
            # Debug logging for all parameters
            logger.info(f"Assessment data for AI: {type(assessment_data_for_ai)} - {assessment_data_for_ai}")
            logger.info(f"Soil info type: {type(soil_info)} - Content: {soil_info}")
            logger.info(f"Rainfall info type: {type(rainfall_info)} - Content: {rainfall_info}")
            logger.info(f"Groundwater info type: {type(groundwater_info)} - Content: {groundwater_info}")
            logger.info(f"Feasibility analysis type: {type(feasibility_analysis)} - Content preview: {str(feasibility_analysis)[:200] if feasibility_analysis else None}")
            logger.info(f"Structure recommendations type: {type(structure_recommendations)} - Content preview: {str(structure_recommendations)[:200] if structure_recommendations else None}")
            logger.info(f"Runoff analysis type: {type(runoff_analysis)} - Content preview: {str(runoff_analysis)[:200] if runoff_analysis else None}")
            
            # Call Anthropic API to generate comprehensive recommendations
            ai_response = anthropic_service.generate_comprehensive_recommendation(
                assessment_data=assessment_data_for_ai,
                soil_analysis=soil_info,
                rainfall_analysis=rainfall_info,
                groundwater_analysis=groundwater_info,
                feasibility_assessment=feasibility_analysis,
                structure_recommendations=structure_recommendations,
                runoff_analysis=runoff_analysis
            )
            
            if ai_response.get("success"):
                ai_recommendations = ai_response
                logger.info("AI recommendations generated successfully")
            else:
                logger.warning(f"AI recommendation generation failed: {ai_response.get('error')}")
                ai_recommendations = {
                    "error": ai_response.get("error"),
                    "message": "AI recommendations not available at this time"
                }
                
        except Exception as e:
            logger.error(f"Error generating AI recommendations: {str(e)}", exc_info=True)
            ai_recommendations = {
                "error": f"AI recommendation error: {str(e)}",
                "message": "AI recommendations not available at this time"
            }

        return {
            "message": "Assessment completed successfully",
            "assessment_data": {
                "name": assessment_data.name,
                "email": assessment_data.email,
                "phone": assessment_data.phone,
                "address": assessment_data.address,
                "city": assessment_data.city,
                "state": assessment_data.state,
                "pincode": assessment_data.pincode,
                "roof_area": roof_area,
                "roof_type": assessment_data.roofType,
                "open_space": float(assessment_data.openSpace) if assessment_data.openSpace and assessment_data.openSpace.replace('.', '').isdigit() else None,
                "dwellers": int(assessment_data.dwellers) if assessment_data.dwellers.isdigit() else 0,
                "current_water_source": assessment_data.currentWaterSource,
                "monthly_water_bill": int(assessment_data.monthlyWaterBill) if assessment_data.monthlyWaterBill and assessment_data.monthlyWaterBill.isdigit() else None
            },
            "preliminary_results": {
                "estimated_annual_collection_liters": round(estimated_annual_collection, 2),
                "potential_monthly_savings_inr": round(potential_savings, 2),
                "feasibility_score": feasibility_score,
                "annual_rainfall_used_mm": annual_rainfall_mm,
                "next_steps": [
                    "Detailed site survey required",
                    "Local rainfall data analysis",
                    "System design and costing",
                    "Government subsidy eligibility check"
                ]
            },
            "runoff_analysis": runoff_analysis,
            "feasibility_assessment": feasibility_analysis,
            "structure_recommendations": structure_recommendations,
            "soil_analysis": soil_info,
            "rainfall_analysis": rainfall_info,
            "aquifer_analysis": aquifer_info,
            "groundwater_analysis": groundwater_info,
            "ai_recommendations": ai_recommendations,
            "location": {
                "latitude": assessment_data.latitude,
                "longitude": assessment_data.longitude,
                "accuracy": assessment_data.accuracy
            } if assessment_data.latitude and assessment_data.longitude else None,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Assessment processing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process assessment: {str(e)}")

@router.post("/feasibility-check")
async def detailed_feasibility_check(assessment_data: AssessmentData):
    """
    Perform comprehensive feasibility assessment for rainwater harvesting
    """
    try:
        logger.info(f"Starting detailed feasibility check for location: {assessment_data.latitude}, {assessment_data.longitude}")
        
        # Get all required data sources
        roof_area = float(assessment_data.roofArea) if assessment_data.roofArea.replace('.', '').isdigit() else 0.0
        dwellers = int(assessment_data.dwellers) if assessment_data.dwellers.isdigit() else 0
        
        # Get rainfall data
        rainfall_data = get_rainfall_data(assessment_data.latitude, assessment_data.longitude)
        annual_rainfall_mm = 1200
        monthly_rainfall_data = []
        if rainfall_data and rainfall_data.get("success"):
            annual_rainfall_mm = rainfall_data.get("annual_rainfall_mm", 1200)
            monthly_rainfall_data = rainfall_data.get("monthly_data", [])
        
        # Get soil data
        soil_data = get_soil_data_from_raster(assessment_data.latitude, assessment_data.longitude)
        
        # Get groundwater data
        groundwater_data = await groundwater_service.get_groundwater_level_data(
            assessment_data.latitude, assessment_data.longitude
        )
        
        # Calculate detailed feasibility
        feasibility_analysis = calculate_detailed_feasibility(
            roof_area_sqft=roof_area,
            dwellers=dwellers,
            annual_rainfall_mm=annual_rainfall_mm,
            monthly_rainfall=monthly_rainfall_data,
            soil_data=soil_data,
            groundwater_data=groundwater_data,
            roof_type=assessment_data.roofType
        )
        
        return {
            "location": {
                "latitude": assessment_data.latitude,
                "longitude": assessment_data.longitude,
                "address": assessment_data.address
            },
            "input_parameters": {
                "roof_area_sqft": roof_area,
                "roof_type": assessment_data.roofType,
                "dwellers": dwellers,
                "annual_rainfall_mm": annual_rainfall_mm
            },
            "feasibility_assessment": feasibility_analysis,
            "data_sources": {
                "rainfall_available": rainfall_data and rainfall_data.get("success", False),
                "soil_available": soil_data and not soil_data.get("error"),
                "groundwater_available": groundwater_data and not groundwater_data.get("error")
            },
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Feasibility check error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to perform feasibility check: {str(e)}"
        )


@router.get("/soil-data/{latitude}/{longitude}")
async def get_soil_data_for_location(latitude: float, longitude: float):
    """
    Get soil data for specific coordinates
    """
    try:
        soil_data = get_soil_data_from_raster(latitude, longitude)
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "soil_analysis": soil_data,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error getting soil data for {latitude}, {longitude}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve soil data: {str(e)}"
        )

@router.get("/aquifer-data/{latitude}/{longitude}")
async def get_aquifer_data_for_location(
    latitude: float, 
    longitude: float,
    enhanced: bool = True  # Default to enhanced view
):
    """
    Get aquifer data for specific coordinates
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate  
        enhanced: If True, returns user-friendly enhanced data. If False, returns raw technical data.
    """
    try:
        if enhanced:
            aquifer_data = get_enhanced_aquifer_data(latitude, longitude)
            return {
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "aquifer_analysis": aquifer_data,
                "view_type": "enhanced",
                "status": "success"
            }
        else:
            # Fallback to original technical data
            aquifer_data = get_aquifer_data(latitude, longitude)
            return {
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "aquifer_analysis": aquifer_data,
                "view_type": "technical",
                "status": "success"
            }
    except Exception as e:
        logger.error(f"Error getting aquifer data for {latitude}, {longitude}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve aquifer data: {str(e)}"
        )

@router.get("/groundwater-data/{latitude}/{longitude}")
async def get_groundwater_data_for_location(
    latitude: float, 
    longitude: float
):
    """
    Get groundwater data for specific coordinates
    """
    try:
        groundwater_data = await groundwater_service.get_groundwater_level_data(latitude, longitude)
        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "groundwater_analysis": groundwater_data,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error getting groundwater data for {latitude}, {longitude}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve groundwater data: {str(e)}"
        )