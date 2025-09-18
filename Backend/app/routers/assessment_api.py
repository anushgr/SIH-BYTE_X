from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
import httpx
from ..soil_data.enhanced_soil_service import get_soil_data_from_raster
from ..aquifer_service import get_aquifer_data
from ..enhanced_aquifer_service import get_enhanced_aquifer_data

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assessment", tags=["assessment"])

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
        soil_data_error = None
        
        rainfall_data = None
        rainfall_error = None
        
        aquifer_data = None
        aquifer_error = None
        rainfall_error = None
        
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
        
        # Calculate preliminary assessment metrics
        estimated_annual_collection = 0
        potential_savings = 0
        roof_area = float(assessment_data.roofArea) if assessment_data.roofArea.replace('.', '').isdigit() else 0.0
        monthly_bill = float(assessment_data.monthlyWaterBill) if assessment_data.monthlyWaterBill and assessment_data.monthlyWaterBill.replace('.', '').isdigit() else None
        
        # Use actual rainfall data if available, otherwise fallback to average
        annual_rainfall_mm = 1200  # Default average for India
        if rainfall_data and rainfall_data.get("success"):
            annual_rainfall_mm = rainfall_data.get("annual_rainfall_mm", 1200)
        
        if roof_area > 0:
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
        
        return {
            "message": "Assessment completed successfully",
            "assessment_data": {
                "name": assessment_data.name,
                "email": assessment_data.email,
                "address": assessment_data.address,
                "city": assessment_data.city,
                "state": assessment_data.state,
                "roof_area": roof_area,
                "dwellers": int(assessment_data.dwellers) if assessment_data.dwellers.isdigit() else 0
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
            "soil_analysis": soil_info,
            "rainfall_analysis": rainfall_info,
            "aquifer_analysis": aquifer_info,
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