import rasterio
import geopandas as gpd
from pyproj import Transformer
import os
import logging

logger = logging.getLogger(__name__)

def get_soil_data_from_raster(lat, lon):
    """
    Given a latitude and longitude in WGS84,
    return the soil type information from the raster with enhanced RWH suitability analysis.
    """
    try:
        # Get the directory where this file is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load raster
        raster_path = os.path.join(current_dir, "SOILTEXTURE.tif")
        dbf_path = os.path.join(current_dir, "SOILTEXTURE.tif.vat.dbf")
        
        if not os.path.exists(raster_path) or not os.path.exists(dbf_path):
            return {
                "error": "Soil data files not found",
                "latitude": lat,
                "longitude": lon,
                "success": False
            }
        
        raster = rasterio.open(raster_path)
        
        # Load soil attribute table (DBF file)
        soil_attr = gpd.read_file(dbf_path)
        
        # Transformer: WGS84 (lat/lon) → raster CRS
        transformer = Transformer.from_crs("EPSG:4326", raster.crs, always_xy=True)
        
        # Step 1: Reproject lon/lat → raster CRS
        x, y = transformer.transform(lon, lat)

        # Step 2: Convert to raster pixel (row, col)
        row, col = raster.index(x, y)

        # Step 3: Bounds check
        if row < 0 or row >= raster.height or col < 0 or col >= raster.width:
            return {
                "error": "Point is outside raster extent",
                "latitude": lat,
                "longitude": lon,
                "success": False
            }

        # Step 4: Get raster value at pixel
        soil_code = raster.read(1)[row, col]

        # Step 5: Match raster value to soil attribute table
        match = soil_attr[soil_attr["value"] == soil_code]

        if not match.empty:
            soil_info = match.to_dict(orient="records")[0]
            
            # Enhanced data with RWH suitability
            soil_type = soil_info.get("descr", "Unknown")
            soil_description = soil_info.get("descr_map", "")
            
            # Enhanced RWH suitability analysis based on soil texture
            rwh_suitability = get_rwh_suitability(soil_type, soil_description)
            
            return {
                "soil_code": int(soil_code),
                "soil_type": soil_type,
                "soil_class": soil_description,
                "soil_description": soil_description,
                "latitude": lat,
                "longitude": lon,
                "success": True,
                "rwh_suitability": rwh_suitability,
                "raw_data": soil_info
            }
        else:
            return {
                "soil_code": int(soil_code),
                "soil_type": "Unknown",
                "soil_class": "Unknown",
                "latitude": lat,
                "longitude": lon,
                "success": True,
                "rwh_suitability": {
                    "suitability": "Unknown",
                    "suitability_score": 0,
                    "infiltration_rate": "Unknown",
                    "recommendations": ["Soil data not available for this location"]
                }
            }
            
    except Exception as e:
        logger.error(f"Error in soil data extraction: {str(e)}")
        return {
            "error": f"Failed to extract soil data: {str(e)}",
            "latitude": lat,
            "longitude": lon,
            "success": False
        }

def get_rwh_suitability(soil_type, soil_description):
    """
    Determine rainwater harvesting suitability based on soil type and description
    """
    soil_type_lower = soil_type.lower()
    soil_desc_lower = soil_description.lower()
    
    # Enhanced suitability analysis
    if "data not available" in soil_type_lower:
        return {
            "suitability": "Unknown",
            "suitability_score": 0,
            "infiltration_rate": "Unknown",
            "recommendations": ["Soil data not available for this location", "Consider site survey for soil analysis"]
        }
    elif "fine texture" in soil_type_lower or any(clay in soil_desc_lower for clay in ["clay", "loamy clay", "silty clay"]):
        return {
            "suitability": "Excellent",
            "suitability_score": 9,
            "infiltration_rate": "Low (0.1-1.0 cm/hr)",
            "recommendations": [
                "Excellent for rainwater storage tanks",
                "Low permeability reduces water loss",
                "Ideal for lined ponds and reservoirs",
                "Consider overflow management systems"
            ]
        }
    elif "medium texture" in soil_type_lower or any(loam in soil_desc_lower for loam in ["loam", "silt loam", "sandy loam"]):
        return {
            "suitability": "Very Good",
            "suitability_score": 8,
            "infiltration_rate": "Medium (1.0-5.0 cm/hr)",
            "recommendations": [
                "Very good for both storage and recharge",
                "Balanced infiltration and retention",
                "Suitable for recharge wells and storage",
                "Consider both surface and groundwater systems"
            ]
        }
    elif "coarse texture" in soil_type_lower or any(sand in soil_desc_lower for sand in ["sand", "loamy sand"]):
        return {
            "suitability": "Good",
            "suitability_score": 7,
            "infiltration_rate": "High (5.0-20.0 cm/hr)",
            "recommendations": [
                "Excellent for groundwater recharge",
                "High permeability allows quick infiltration",
                "Ideal for recharge pits and wells",
                "May require lined storage for retention"
            ]
        }
    elif "rocky" in soil_type_lower or "non soil" in soil_type_lower:
        return {
            "suitability": "Fair",
            "suitability_score": 5,
            "infiltration_rate": "Variable",
            "recommendations": [
                "Challenging terrain for RWH",
                "Focus on surface collection and storage",
                "Consider above-ground tank systems",
                "May require specialized installation techniques"
            ]
        }
    else:
        return {
            "suitability": "Moderate",
            "suitability_score": 6,
            "infiltration_rate": "Unknown",
            "recommendations": [
                "Site-specific analysis recommended",
                "Consider pilot testing for infiltration rates",
                "Consult local soil experts",
                "Implement based on local conditions"
            ]
        }

# Test function
if __name__ == "__main__":
    # Example point
    lat, lon = 12.917727, 77.513259
    
    result = get_soil_data_from_raster(lat, lon)
    print("Enhanced Soil Analysis Result:")
    import json
    print(json.dumps(result, indent=2))