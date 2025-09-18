import geopandas as gpd
from shapely.geometry import Point
import os
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class EnhancedAquiferService:
    """
    Enhanced service class for aquifer data lookup with user-friendly formatting
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
    
    def _categorize_depth(self, depth_range: str) -> Dict[str, str]:
        """
        Categorize depth range into user-friendly terms
        """
        if not depth_range or depth_range.lower() == 'unknown':
            return {
                "category": "Unknown",
                "description": "Depth information not available"
            }
        
        # Extract numeric values from depth range
        try:
            # Handle ranges like "5-20", "10-50", etc.
            depth_str = str(depth_range).lower()
            if '-' in depth_str:
                min_depth, max_depth = map(float, depth_str.split('-'))
                avg_depth = (min_depth + max_depth) / 2
            else:
                avg_depth = float(depth_str)
        except:
            return {
                "category": "Variable",
                "description": "Depth varies by location"
            }
        
        if avg_depth <= 20:
            return {
                "category": "Shallow",
                "description": f"{depth_range} meters - Easy to access with regular borewells"
            }
        elif avg_depth <= 50:
            return {
                "category": "Medium",
                "description": f"{depth_range} meters - Requires moderate drilling depth"
            }
        else:
            return {
                "category": "Deep",
                "description": f"{depth_range} meters - Requires deep drilling, higher costs"
            }
    
    def _categorize_yield(self, yield_range: str) -> Dict[str, str]:
        """
        Categorize yield into user-friendly terms with household equivalents
        """
        if not yield_range or yield_range.lower() == 'unknown':
            return {
                "category": "Unknown",
                "description": "Water yield information not available",
                "household_equivalent": "Data not available"
            }
        
        try:
            # Extract numeric values from yield range (assumes m³/day)
            yield_str = str(yield_range).lower().replace('m³/day', '').replace('m3/day', '').strip()
            if '-' in yield_str:
                min_yield, max_yield = map(float, yield_str.split('-'))
                avg_yield = (min_yield + max_yield) / 2
            else:
                avg_yield = float(yield_str)
        except:
            return {
                "category": "Variable",
                "description": "Yield varies significantly by location",
                "household_equivalent": "Depends on local conditions"
            }
        
        # Assuming ~2 m³/day per household for basic needs
        households = int(avg_yield / 2)
        
        if avg_yield <= 50:
            return {
                "category": "Low",
                "description": f"{yield_range} m³/day - Suitable for small villages",
                "household_equivalent": f"Can supply ~{households} households"
            }
        elif avg_yield <= 200:
            return {
                "category": "Medium",
                "description": f"{yield_range} m³/day - Good for villages and small towns",
                "household_equivalent": f"Can supply ~{households} households"
            }
        else:
            return {
                "category": "High",
                "description": f"{yield_range} m³/day - Suitable for towns and irrigation",
                "household_equivalent": f"Can supply ~{households} households"
            }
    
    def _categorize_permeability(self, permeability: str) -> Dict[str, str]:
        """
        Categorize permeability into user-friendly terms
        """
        if not permeability or permeability.lower() == 'unknown':
            return {
                "category": "Unknown",
                "description": "Water flow information not available"
            }
        
        perm_lower = str(permeability).lower()
        
        if 'high' in perm_lower:
            return {
                "category": "High",
                "description": "Water flows easily through this rock - good for steady supply"
            }
        elif 'moderate' in perm_lower or 'medium' in perm_lower:
            return {
                "category": "Moderate",
                "description": "Water flows moderately well - borewells can provide steady water"
            }
        elif 'low' in perm_lower:
            return {
                "category": "Low",
                "description": "Water flows slowly - yield may be limited"
            }
        else:
            return {
                "category": "Variable",
                "description": "Water flow depends on local rock conditions"
            }
    
    def _get_suitability_assessment(self, aquifer_data: Dict) -> Dict[str, str]:
        """
        Provide overall suitability assessment for rainwater harvesting
        """
        # Get categorized data
        depth_cat = self._categorize_depth(aquifer_data.get('DEPTH_RANGE', ''))
        yield_cat = self._categorize_yield(aquifer_data.get('YIELD_RANGE', ''))
        perm_cat = self._categorize_permeability(aquifer_data.get('PERMEABILITY', ''))
        
        # Score based on categories (simplified scoring)
        score = 0
        if depth_cat['category'] == 'Shallow':
            score += 3
        elif depth_cat['category'] == 'Medium':
            score += 2
        elif depth_cat['category'] == 'Deep':
            score += 1
            
        if yield_cat['category'] == 'High':
            score += 3
        elif yield_cat['category'] == 'Medium':
            score += 2
        elif yield_cat['category'] == 'Low':
            score += 1
            
        if perm_cat['category'] == 'High':
            score += 3
        elif perm_cat['category'] == 'Moderate':
            score += 2
        elif perm_cat['category'] == 'Low':
            score += 1
        
        # Determine suitability
        if score >= 7:
            return {
                "level": "Excellent",
                "description": "Ideal conditions for rainwater harvesting and groundwater recharge",
                "recommendation": "Highly recommended for both direct use and recharge systems"
            }
        elif score >= 5:
            return {
                "level": "Good",
                "description": "Suitable for rainwater harvesting with good potential",
                "recommendation": "Recommended for rainwater harvesting and moderate recharge"
            }
        elif score >= 3:
            return {
                "level": "Fair",
                "description": "Moderate potential for rainwater harvesting",
                "recommendation": "Consider with proper system design and maintenance"
            }
        else:
            return {
                "level": "Limited",
                "description": "Limited potential due to geological constraints",
                "recommendation": "Focus on surface storage rather than recharge"
            }
    
    def _enhance_aquifer_data(self, raw_aquifer: Dict) -> Dict[str, Any]:
        """
        Transform raw aquifer data into user-friendly format
        """
        # Get basic information
        name = raw_aquifer.get('NAME', 'Unknown Aquifer')
        aquifer_type = raw_aquifer.get('TYPE', 'Unknown')
        state = raw_aquifer.get('STATE', 'Unknown')
        
        # Categorize technical data
        depth_info = self._categorize_depth(raw_aquifer.get('DEPTH_RANGE', ''))
        yield_info = self._categorize_yield(raw_aquifer.get('YIELD_RANGE', ''))
        perm_info = self._categorize_permeability(raw_aquifer.get('PERMEABILITY', ''))
        
        # Get suitability assessment
        suitability = self._get_suitability_assessment(raw_aquifer)
        
        # Determine water storage type
        storage_type = "Unknown"
        if 'unconfined' in str(raw_aquifer.get('CONFINEMENT', '')).lower():
            storage_type = "Mostly unconfined (water table varies with rainfall)"
        elif 'confined' in str(raw_aquifer.get('CONFINEMENT', '')).lower():
            storage_type = "Confined (pressurized water, more stable)"
        elif 'semi' in str(raw_aquifer.get('CONFINEMENT', '')).lower():
            storage_type = "Semi-confined (partially protected water)"
        
        # Create enhanced data structure
        enhanced = {
            "basic_info": {
                "name": name,
                "type": aquifer_type,
                "location": f"Found in {state}",
                "water_storage": storage_type
            },
            "water_characteristics": {
                "depth": {
                    "category": depth_info['category'],
                    "description": depth_info['description'],
                    "raw_data": raw_aquifer.get('DEPTH_RANGE', 'Unknown')
                },
                "yield": {
                    "category": yield_info['category'],
                    "description": yield_info['description'],
                    "household_equivalent": yield_info.get('household_equivalent', 'Unknown'),
                    "raw_data": raw_aquifer.get('YIELD_RANGE', 'Unknown')
                },
                "permeability": {
                    "category": perm_info['category'],
                    "description": perm_info['description'],
                    "raw_data": raw_aquifer.get('PERMEABILITY', 'Unknown')
                }
            },
            "rwh_suitability": {
                "level": suitability['level'],
                "description": suitability['description'],
                "recommendation": suitability['recommendation']
            },
            "seasonal_notes": {
                "recharge": "Depends on monsoon rainfall for recharge",
                "reliability": "Water levels may fall during summer months",
                "maintenance": "Regular monitoring recommended for sustainable use"
            },
            "technical_details": {
                "transmissivity": raw_aquifer.get('TRANSMISSIVITY', 'Unknown'),
                "storage_coefficient": raw_aquifer.get('STORAGE_COEFF', 'Unknown'),
                "hydraulic_conductivity": raw_aquifer.get('HYDRAULIC_COND', 'Unknown'),
                "porosity": raw_aquifer.get('POROSITY', 'Unknown')
            }
        }
        
        return enhanced
    
    def find_aquifer(self, latitude: float, longitude: float) -> Optional[List[Dict[str, Any]]]:
        """
        Find aquifers at the given coordinates with enhanced formatting
        """
        if self.gdf is None:
            logger.error("Aquifer data not loaded")
            return None
        
        try:
            # Create a Point geometry from the input coordinates
            point = Point(longitude, latitude)
            
            # Create a GeoDataFrame with the input point
            point_gdf = gpd.GeoDataFrame(geometry=[point], crs='EPSG:4326')
            
            # Find aquifers that contain the point
            matching_aquifers = self.gdf[self.gdf.geometry.contains(point)]
            
            if not matching_aquifers.empty:
                results = []
                for _, row in matching_aquifers.iterrows():
                    raw_aquifer = row.drop('geometry').to_dict()
                    # Convert numpy types to Python native types
                    raw_aquifer = {k: (v.item() if hasattr(v, 'item') else v) for k, v in raw_aquifer.items()}
                    
                    # Enhance the aquifer data
                    enhanced_aquifer = self._enhance_aquifer_data(raw_aquifer)
                    results.append(enhanced_aquifer)
                
                logger.info(f"Found {len(results)} enhanced aquifer(s) at coordinates ({latitude}, {longitude})")
                return results
            else:
                logger.info(f"No aquifers found at coordinates ({latitude}, {longitude})")
                return None
                
        except Exception as e:
            logger.error(f"Error finding aquifer at coordinates ({latitude}, {longitude}): {str(e)}")
            return None

# Create a global instance
enhanced_aquifer_service = EnhancedAquiferService()

def get_enhanced_aquifer_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Get enhanced aquifer data for given coordinates
    """
    try:
        aquifer_data = enhanced_aquifer_service.find_aquifer(latitude, longitude)
        
        if aquifer_data:
            return {
                "success": True,
                "aquifers": aquifer_data,
                "count": len(aquifer_data),
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "summary": {
                    "total_aquifers": len(aquifer_data),
                    "primary_aquifer": aquifer_data[0]["basic_info"]["name"] if aquifer_data else None,
                    "overall_suitability": aquifer_data[0]["rwh_suitability"]["level"] if aquifer_data else None
                }
            }
        else:
            return {
                "success": False,
                "message": "No aquifers found at this location - consider surface storage systems",
                "aquifers": [],
                "count": 0,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "recommendation": {
                    "alternative": "Focus on rooftop rainwater harvesting with storage tanks",
                    "reason": "No major aquifers detected for groundwater recharge"
                }
            }
            
    except Exception as e:
        logger.error(f"Error retrieving enhanced aquifer data: {str(e)}")
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