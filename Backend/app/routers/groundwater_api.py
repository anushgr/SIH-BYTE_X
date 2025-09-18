from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Annotated, Dict, Any
import logging
from ..ground_water_level import groundwater_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/groundwater", tags=["Groundwater API"])

class GroundwaterRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")

class GroundwaterResponse(BaseModel):
    input_coordinates: Dict[str, float]
    nearest_station: Dict[str, Any]
    data_availability: Dict[str, bool]
    groundwater_analysis: Dict[str, Any]
    error: str = None

@router.post("/level-data")
async def get_groundwater_level_data(request: GroundwaterRequest) -> Dict[str, Any]:
    """
    Get groundwater level data for given coordinates.
    
    This endpoint:
    1. Finds the nearest groundwater monitoring station
    2. Fetches data from India WRIS API for 2024-2025 period
    3. Falls back to 2023-2024 if recent data unavailable
    4. Returns both annual summary and monthly breakdown
    """
    try:
        logger.info(f"Processing groundwater request for coordinates: {request.latitude}, {request.longitude}")
        
        result = await groundwater_service.get_groundwater_level_data(
            request.latitude, 
            request.longitude
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing groundwater request: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch groundwater data: {str(e)}"
        )

@router.get("/level-data")
async def get_groundwater_level_data_get(
    latitude: Annotated[float, Field(ge=-90, le=90)] = Query(..., description="Latitude coordinate"),
    longitude: Annotated[float, Field(ge=-180, le=180)] = Query(..., description="Longitude coordinate")
) -> Dict[str, Any]:
    """
    Get groundwater level data for given coordinates (GET version).
    
    This endpoint:
    1. Finds the nearest groundwater monitoring station
    2. Fetches data from India WRIS API for 2024-2025 period
    3. Falls back to 2023-2024 if recent data unavailable
    4. Returns both annual summary and monthly breakdown
    """
    try:
        logger.info(f"Processing groundwater GET request for coordinates: {latitude}, {longitude}")
        
        result = await groundwater_service.get_groundwater_level_data(latitude, longitude)
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing groundwater GET request: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch groundwater data: {str(e)}"
        )

@router.get("/nearest-station")
async def get_nearest_station(
    latitude: Annotated[float, Field(ge=-90, le=90)] = Query(..., description="Latitude coordinate"),
    longitude: Annotated[float, Field(ge=-180, le=180)] = Query(..., description="Longitude coordinate")
) -> Dict[str, Any]:
    """
    Find the nearest groundwater monitoring station for given coordinates.
    """
    try:
        logger.info(f"Finding nearest station for coordinates: {latitude}, {longitude}")
        
        nearest_station = groundwater_service.find_nearest_station(latitude, longitude)
        
        if not nearest_station:
            raise HTTPException(
                status_code=404, 
                detail="No nearby groundwater monitoring station found"
            )
        
        return {
            "input_coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "nearest_station": nearest_station
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding nearest station: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to find nearest station: {str(e)}"
        )

@router.get("/stations/count")
async def get_stations_count() -> Dict[str, int]:
    """
    Get the total number of available groundwater monitoring stations.
    """
    try:
        if groundwater_service.station_data:
            count = len(groundwater_service.station_data)
        else:
            count = 0
        
        return {
            "total_stations": count
        }
        
    except Exception as e:
        logger.error(f"Error getting stations count: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get stations count: {str(e)}"
        )