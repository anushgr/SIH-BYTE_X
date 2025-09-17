"""
Soil data service for extracting soil type information from GIS raster data.
Based on the soil texture analysis using SOILTEXTURE.tif raster data.
"""

import os
import logging
from typing import Dict, Optional
import rasterio
import geopandas as gpd
from pyproj import Transformer

logger = logging.getLogger(__name__)

class SoilDataService:
    """Service for extracting soil type information from raster data."""
    
    def __init__(self):
        self.raster_path = os.path.join(os.path.dirname(__file__), "soil_data", "SOILTEXTURE.tif")
        self.dbf_path = os.path.join(os.path.dirname(__file__), "soil_data", "SOILTEXTURE.tif.vat.dbf")
        self.raster = None
        self.soil_attr = None
        self.transformer = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the raster data and transformer."""
        try:
            # Check if files exist
            if not os.path.exists(self.raster_path):
                logger.error(f"Soil raster file not found: {self.raster_path}")
                return
            
            if not os.path.exists(self.dbf_path):
                logger.error(f"Soil attribute file not found: {self.dbf_path}")
                return
            
            # Load raster
            self.raster = rasterio.open(self.raster_path)
            logger.info(f"Loaded soil raster with CRS: {self.raster.crs}")
            
            # Load soil attribute table (DBF file)
            self.soil_attr = gpd.read_file(self.dbf_path)
            logger.info(f"Loaded soil attributes with {len(self.soil_attr)} soil classes")
            
            # Create transformer: WGS84 (lat/lon) → raster CRS
            self.transformer = Transformer.from_crs("EPSG:4326", self.raster.crs, always_xy=True)
            
        except Exception as e:
            logger.error(f"Failed to initialize soil data service: {str(e)}")
            self.raster = None
            self.soil_attr = None
            self.transformer = None
    
    def is_available(self) -> bool:
        """Check if soil data service is available."""
        return (self.raster is not None and 
                self.soil_attr is not None and 
                not self.soil_attr.empty and
                self.transformer is not None)
    
    def get_soil_type(self, latitude: float, longitude: float) -> Dict:
        """
        Get soil type information for given coordinates.
        
        Args:
            latitude: Latitude in WGS84
            longitude: Longitude in WGS84
            
        Returns:
            Dictionary containing soil information or error message
        """
        if not self.is_available():
            return {
                "error": "Soil data service not available",
                "soil_type": "Unknown",
                "soil_code": None
            }
        
        try:
            # Step 1: Reproject lon/lat → raster CRS
            x, y = self.transformer.transform(longitude, latitude)
            
            # Step 2: Convert to raster pixel (row, col)
            row, col = self.raster.index(x, y)
            
            # Step 3: Bounds check
            if row < 0 or row >= self.raster.height or col < 0 or col >= self.raster.width:
                return {
                    "error": "Point is outside soil data coverage area",
                    "soil_type": "Unknown",
                    "soil_code": None,
                    "latitude": latitude,
                    "longitude": longitude
                }
            
            # Step 4: Get raster value at pixel
            raster_data = self.raster.read(1)
            soil_code = raster_data[row, col]
            
            # Handle NoData values
            if soil_code == self.raster.nodata or soil_code == 0:
                return {
                    "error": "No soil data available at this location",
                    "soil_type": "Unknown", 
                    "soil_code": None,
                    "latitude": latitude,
                    "longitude": longitude
                }
            
            # Step 5: Match raster value to soil attribute table
            try:
                match = self.soil_attr[self.soil_attr["value"] == soil_code]
                
                if len(match) > 0:
                    soil_data = match.iloc[0].to_dict()
                    return {
                        "soil_code": int(soil_code),
                        "soil_type": soil_data.get("TEXTURE", "Unknown"),
                        "soil_class": soil_data.get("CLASS", "Unknown"),
                        "latitude": latitude,
                        "longitude": longitude,
                        "success": True
                    }
                else:
                    return {
                        "soil_code": int(soil_code),
                        "soil_type": "Unknown",
                        "soil_class": "Unknown",
                        "latitude": latitude,
                        "longitude": longitude,
                        "error": "Soil classification not found"
                    }
            except Exception as match_error:
                logger.error(f"Error matching soil data: {str(match_error)}")
                return {
                    "soil_code": int(soil_code),
                    "soil_type": "Unknown",
                    "soil_class": "Unknown",
                    "latitude": latitude,
                    "longitude": longitude,
                    "error": f"Soil matching error: {str(match_error)}"
                }
                
        except Exception as e:
            logger.error(f"Error extracting soil data for lat={latitude}, lon={longitude}: {str(e)}")
            return {
                "error": f"Failed to extract soil data: {str(e)}",
                "soil_type": "Unknown",
                "soil_code": None,
                "latitude": latitude,
                "longitude": longitude
            }
    
    def get_soil_suitability_for_rwh(self, soil_data: Dict) -> Dict:
        """
        Assess soil suitability for rainwater harvesting based on soil type.
        
        Args:
            soil_data: Dictionary containing soil information
            
        Returns:
            Dictionary with suitability assessment
        """
        if soil_data.get("error") or soil_data.get("soil_type") == "Unknown":
            return {
                "suitability": "Unknown",
                "suitability_score": 0,
                "recommendations": ["Soil data not available for this location"]
            }
        
        soil_type = soil_data.get("soil_type", "").lower()
        
        # Define soil suitability for rainwater harvesting
        if any(soil in soil_type for soil in ["clay", "clayey"]):
            return {
                "suitability": "Excellent",
                "suitability_score": 9,
                "infiltration_rate": "Low",
                "recommendations": [
                    "Clay soil is excellent for water retention",
                    "Ideal for surface water collection and storage",
                    "Consider lined tanks for optimal storage",
                    "Good for recharge wells with proper filtration"
                ]
            }
        elif any(soil in soil_type for soil in ["loam", "loamy"]):
            return {
                "suitability": "Very Good",
                "suitability_score": 8,
                "infiltration_rate": "Moderate",
                "recommendations": [
                    "Loamy soil provides balanced drainage and retention",
                    "Suitable for both storage and recharge systems",
                    "Good for infiltration basins and bioswales",
                    "Recommended for comprehensive RWH systems"
                ]
            }
        elif any(soil in soil_type for soil in ["silt", "silty"]):
            return {
                "suitability": "Good",
                "suitability_score": 7,
                "infiltration_rate": "Moderate-Low",
                "recommendations": [
                    "Silty soil offers moderate water retention",
                    "Suitable for storage systems",
                    "May require filtration for recharge applications",
                    "Good for shallow infiltration systems"
                ]
            }
        elif any(soil in soil_type for soil in ["sand", "sandy"]):
            return {
                "suitability": "Fair",
                "suitability_score": 5,
                "infiltration_rate": "High",
                "recommendations": [
                    "Sandy soil has high drainage - good for recharge",
                    "Not ideal for surface water storage",
                    "Excellent for infiltration wells and pits",
                    "Consider underground storage systems",
                    "May need soil amendments for retention"
                ]
            }
        else:
            return {
                "suitability": "Moderate",
                "suitability_score": 6,
                "infiltration_rate": "Variable",
                "recommendations": [
                    "Site-specific soil analysis recommended",
                    "Consider pilot testing for infiltration rates",
                    "Mixed approach with storage and recharge systems"
                ]
            }
    
    def __del__(self):
        """Clean up resources."""
        if self.raster:
            try:
                self.raster.close()
            except:
                pass


# Global instance
soil_service = SoilDataService()

def get_soil_data(latitude: float, longitude: float) -> Dict:
    """
    Convenience function to get soil data for coordinates.
    
    Args:
        latitude: Latitude in WGS84
        longitude: Longitude in WGS84
        
    Returns:
        Dictionary containing soil information and suitability assessment
    """
    soil_data = soil_service.get_soil_type(latitude, longitude)
    suitability = soil_service.get_soil_suitability_for_rwh(soil_data)
    
    return {
        **soil_data,
        "rwh_suitability": suitability
    }