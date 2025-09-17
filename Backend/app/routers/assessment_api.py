from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import json
import logging
from ..database import get_db
from ..models import Assessment
from ..schemas import AssessmentCreate, AssessmentResponse
from ..soil_service import get_soil_data

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assessment", tags=["assessment"])

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
async def create_assessment(assessment_data: AssessmentData, db: Session = Depends(get_db)):
    """
    Create a new rainwater harvesting assessment
    """
    try:
        # Initialize soil data variables
        soil_type = None
        soil_class = None
        soil_code = None
        soil_suitability = None
        soil_suitability_score = None
        soil_infiltration_rate = None
        soil_rwh_recommendations = None
        soil_data_error = None
        
        # Get soil data if coordinates are provided
        if assessment_data.latitude and assessment_data.longitude:
            try:
                logger.info(f"Fetching soil data for coordinates: {assessment_data.latitude}, {assessment_data.longitude}")
                soil_data = get_soil_data(assessment_data.latitude, assessment_data.longitude)
                
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
                            soil_rwh_recommendations = json.dumps(recommendations)
                    
                    logger.info(f"Successfully extracted soil data: {soil_type} ({soil_suitability})")
                else:
                    soil_data_error = soil_data.get("error", "Failed to extract soil data") if soil_data else "No soil data returned"
                    logger.warning(f"Failed to extract soil data: {soil_data_error}")
                    
            except Exception as e:
                soil_data_error = f"Soil data extraction error: {str(e)}"
                logger.error(f"Error during soil data extraction: {str(e)}", exc_info=True)
        
        # Create assessment record
        assessment = Assessment(
            name=assessment_data.name,
            email=assessment_data.email,
            phone=assessment_data.phone,
            address=assessment_data.address,
            city=assessment_data.city,
            state=assessment_data.state,
            pincode=assessment_data.pincode,
            dwellers=int(assessment_data.dwellers) if assessment_data.dwellers.isdigit() else 0,
            roof_area=float(assessment_data.roofArea) if assessment_data.roofArea.replace('.', '').isdigit() else 0.0,
            roof_type=assessment_data.roofType,
            open_space=float(assessment_data.openSpace) if assessment_data.openSpace and assessment_data.openSpace.replace('.', '').isdigit() else None,
            current_water_source=assessment_data.currentWaterSource,
            monthly_water_bill=float(assessment_data.monthlyWaterBill) if assessment_data.monthlyWaterBill and assessment_data.monthlyWaterBill.replace('.', '').isdigit() else None,
            latitude=assessment_data.latitude,
            longitude=assessment_data.longitude,
            accuracy=assessment_data.accuracy,
            
            # Add soil data fields
            soil_type=soil_type,
            soil_class=soil_class,
            soil_code=soil_code,
            soil_suitability=soil_suitability,
            soil_suitability_score=soil_suitability_score,
            soil_infiltration_rate=soil_infiltration_rate,
            soil_rwh_recommendations=soil_rwh_recommendations,
            soil_data_error=soil_data_error,
            
            created_at=datetime.utcnow()
        )
        
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        # Calculate preliminary assessment metrics
        estimated_annual_collection = 0
        potential_savings = 0
        
        if assessment.roof_area and assessment.roof_area > 0:
            # Rough calculation: roof_area * average_annual_rainfall * collection_efficiency
            # Using average Indian rainfall of 1200mm and 80% collection efficiency
            estimated_annual_collection = assessment.roof_area * 1200 * 0.8 * 0.092903  # Convert to liters
            
            # Rough savings calculation based on current bill
            if assessment.monthly_water_bill:
                potential_savings = min(assessment.monthly_water_bill * 0.3, assessment.monthly_water_bill * 12 * 0.4)
        
        # Enhanced feasibility scoring based on roof area and soil suitability
        feasibility_score = "Low"
        if assessment.roof_area and assessment.roof_area >= 500:
            if soil_suitability_score and soil_suitability_score >= 8:
                feasibility_score = "Excellent"
            elif soil_suitability_score and soil_suitability_score >= 6:
                feasibility_score = "High"
            else:
                feasibility_score = "High"
        elif assessment.roof_area and assessment.roof_area >= 200:
            if soil_suitability_score and soil_suitability_score >= 7:
                feasibility_score = "High"
            else:
                feasibility_score = "Medium"
        else:
            if soil_suitability_score and soil_suitability_score >= 8:
                feasibility_score = "Medium"
        
        # Prepare soil information for response
        soil_info = None
        if soil_type and soil_type != "Unknown":
            soil_recommendations = []
            if soil_rwh_recommendations:
                try:
                    soil_recommendations = json.loads(soil_rwh_recommendations)
                except Exception as json_error:
                    logger.warning(f"Error parsing soil recommendations JSON: {json_error}")
                    soil_recommendations = []
            
            soil_info = {
                "soil_type": soil_type,
                "soil_class": soil_class,
                "soil_code": soil_code,
                "suitability": soil_suitability,
                "suitability_score": soil_suitability_score,
                "infiltration_rate": soil_infiltration_rate,
                "recommendations": soil_recommendations
            }
        elif soil_data_error:
            # Include error information in response
            soil_info = {
                "error": soil_data_error,
                "message": "Soil analysis not available for this location"
            }
        
        return {
            "message": "Assessment created successfully",
            "assessment_id": assessment.id,
            "preliminary_results": {
                "estimated_annual_collection_liters": round(estimated_annual_collection, 2),
                "potential_monthly_savings_inr": round(potential_savings, 2),
                "feasibility_score": feasibility_score,
                "next_steps": [
                    "Detailed site survey required",
                    "Local rainfall data analysis",
                    "System design and costing",
                    "Government subsidy eligibility check"
                ]
            },
            "soil_analysis": soil_info,
            "location": {
                "latitude": assessment_data.latitude,
                "longitude": assessment_data.longitude,
                "accuracy": assessment_data.accuracy
            } if assessment_data.latitude and assessment_data.longitude else None,
            "status": "success"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create assessment: {str(e)}")

@router.get("/{assessment_id}")
async def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """
    Get assessment details by ID
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Prepare soil information for response
    soil_info = None
    if assessment.soil_type:
        soil_recommendations = []
        if assessment.soil_rwh_recommendations:
            try:
                soil_recommendations = json.loads(assessment.soil_rwh_recommendations)
            except:
                soil_recommendations = []
        
        soil_info = {
            "soil_type": assessment.soil_type,
            "soil_class": assessment.soil_class,
            "soil_code": assessment.soil_code,
            "suitability": assessment.soil_suitability,
            "suitability_score": assessment.soil_suitability_score,
            "infiltration_rate": assessment.soil_infiltration_rate,
            "recommendations": soil_recommendations,
            "data_error": assessment.soil_data_error
        }
    
    # Convert assessment to dict and add soil analysis
    assessment_dict = {
        "id": assessment.id,
        "name": assessment.name,
        "email": assessment.email,
        "phone": assessment.phone,
        "address": assessment.address,
        "city": assessment.city,
        "state": assessment.state,
        "pincode": assessment.pincode,
        "dwellers": assessment.dwellers,
        "roof_area": assessment.roof_area,
        "roof_type": assessment.roof_type,
        "open_space": assessment.open_space,
        "current_water_source": assessment.current_water_source,
        "monthly_water_bill": assessment.monthly_water_bill,
        "latitude": assessment.latitude,
        "longitude": assessment.longitude,
        "accuracy": assessment.accuracy,
        "created_at": assessment.created_at,
        "updated_at": assessment.updated_at,
        "soil_analysis": soil_info
    }
    
    return assessment_dict

@router.get("/")
async def list_assessments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all assessments with pagination
    """
    assessments = db.query(Assessment).offset(skip).limit(limit).all()
    return assessments

@router.get("/soil-data/{latitude}/{longitude}")
async def get_soil_data_for_location(latitude: float, longitude: float):
    """
    Get soil data for specific coordinates
    """
    try:
        soil_data = get_soil_data(latitude, longitude)
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