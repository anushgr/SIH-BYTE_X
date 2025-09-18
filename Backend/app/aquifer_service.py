import geopandas as gpd
from shapely.geometry import Point
import os
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class AquiferService:
    """
    Service class for aquifer data lookup using GeoJSON files
    """
    
    def __init__(self):
        self.gdf = None
        self._load_aquifer_data()
    
    def _load_aquifer_data(self):
        """
        Load the aquifer GeoJSON data
        """
        try:
            # Get the path relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            geojson_path = os.path.join(current_dir, "aquifers", "Major Aquifers.geojson")
            
            if not os.path.exists(geojson_path):
                logger.error(f"Aquifer GeoJSON file not found at: {geojson_path}")
                return
            
            # Load the GeoJSON file
            self.gdf = gpd.read_file(geojson_path)
            
            # Ensure the GeoJSON is in EPSG:4326 (latitude/longitude)
            if self.gdf.crs is None or self.gdf.crs != 'EPSG:4326':
                self.gdf = self.gdf.set_crs('EPSG:4326')
            
            logger.info(f"Successfully loaded aquifer data with {len(self.gdf)} records")
            
        except Exception as e:
            logger.error(f"Error loading aquifer GeoJSON file: {str(e)}")
            self.gdf = None
    
    def find_aquifer(self, latitude: float, longitude: float) -> Optional[List[Dict[str, Any]]]:
        """
        Find aquifers at the given coordinates
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            List of aquifer data dictionaries if found, None if no aquifers found
        """
        if self.gdf is None:
            logger.error("Aquifer data not loaded")
            return None
        
        try:
            # Create a Point geometry from the input coordinates
            point = Point(longitude, latitude)  # Note: Point takes (x, y) -> (longitude, latitude)
            
            # Create a GeoDataFrame with the input point
            point_gdf = gpd.GeoDataFrame(geometry=[point], crs='EPSG:4326')
            
            # Find aquifers that contain the point
            matching_aquifers = self.gdf[self.gdf.geometry.contains(point)]
            
            if not matching_aquifers.empty:
                # Extract properties of matching aquifers
                results = []
                for _, row in matching_aquifers.iterrows():
                    aquifer_data = row.drop('geometry').to_dict()  # Exclude geometry, include all properties
                    # Convert numpy types to Python native types for JSON serialization
                    aquifer_data = {k: (v.item() if hasattr(v, 'item') else v) for k, v in aquifer_data.items()}
                    results.append(aquifer_data)
                
                logger.info(f"Found {len(results)} aquifer(s) at coordinates ({latitude}, {longitude})")
                return results
            else:
                logger.info(f"No aquifers found at coordinates ({latitude}, {longitude})")
                return None
                
        except Exception as e:
            logger.error(f"Error finding aquifer at coordinates ({latitude}, {longitude}): {str(e)}")
            return None

# Create a global instance
aquifer_service = AquiferService()

def get_aquifer_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Get aquifer data for given coordinates
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        
    Returns:
        Dictionary containing aquifer data or error information
    """
    try:
        aquifer_data = aquifer_service.find_aquifer(latitude, longitude)
        
        if aquifer_data:
            return {
                "success": True,
                "aquifers": aquifer_data,
                "count": len(aquifer_data),
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                }
            }
        else:
            return {
                "success": False,
                "message": "No aquifers found at the given location",
                "aquifers": [],
                "count": 0,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                }
            }
            
    except Exception as e:
        logger.error(f"Error retrieving aquifer data: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to retrieve aquifer data: {str(e)}",
            "aquifers": [],
            "count": 0,
            "location": {
                "latitude": latitude,
                "longitude": longitude
            }
        }