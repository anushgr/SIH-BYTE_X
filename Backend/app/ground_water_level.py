"""
Groundwater level service for fetching groundwater data from India WRIS API.
Finds nearest groundwater monitoring station and retrieves level data.
"""

import json
import logging
import math
import os
from typing import Dict, List, Optional, Tuple
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class GroundWaterLevelService:
    """Service for fetching groundwater level data from nearest monitoring station."""
    
    def __init__(self):
        self.station_data_path = os.path.join(os.path.dirname(__file__), "..", "station_data.json")
        self.api_url = "https://indiawris.gov.in/gwlbusinessdata"
        self.station_data = None
        self._load_station_data()
    
    def _load_station_data(self):
        """Load station data from JSON file."""
        try:
            with open(self.station_data_path, 'r', encoding='utf-8') as file:
                content = file.read()
                # Remove comment line if present
                if content.startswith('//'):
                    lines = content.split('\n')
                    content = '\n'.join(lines[1:])  # Skip first line
                
                self.station_data = json.loads(content)
            logger.info(f"Loaded {len(self.station_data)} groundwater stations")
        except Exception as e:
            logger.error(f"Failed to load station data: {e}")
            self.station_data = []
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on Earth.
        Uses the Haversine formula.
        
        Args:
            lat1, lon1: Latitude and longitude of first point
            lat2, lon2: Latitude and longitude of second point
            
        Returns:
            Distance in kilometers
        """
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of Earth in kilometers
        r = 6371
        
        return c * r
    
    def find_nearest_station(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Find the nearest groundwater monitoring station to given coordinates.
        
        Args:
            latitude: Target latitude
            longitude: Target longitude
            
        Returns:
            Dictionary containing nearest station info or None if no data
        """
        if not self.station_data:
            logger.error("No station data available")
            return None
            
        nearest_station = None
        min_distance = float('inf')
        
        for station in self.station_data:
            try:
                # Station data format: [station_name, station_code, longitude, latitude]
                station_name = station[0]
                station_code = station[1]
                station_lon = float(station[2])
                station_lat = float(station[3])
                
                distance = self._calculate_distance(latitude, longitude, station_lat, station_lon)
                
                if distance < min_distance:
                    min_distance = distance
                    nearest_station = {
                        "station_name": station_name,
                        "station_code": station_code,
                        "longitude": station_lon,
                        "latitude": station_lat,
                        "distance_km": round(distance, 2)
                    }
                    
            except (IndexError, ValueError, TypeError) as e:
                logger.warning(f"Skipping invalid station data: {station}, error: {e}")
                continue
        
        if nearest_station:
            logger.info(f"Found nearest station: {nearest_station['station_code']} at {nearest_station['distance_km']} km")
        
        return nearest_station
    
    async def fetch_groundwater_data(self, station_code: str, start_date: str, end_date: str) -> Optional[Dict]:
        """
        Fetch groundwater data from India WRIS API for given station and date range.
        
        Args:
            station_code: Station code to fetch data for
            start_date: Start date in format 'YYYY-MM'
            end_date: End date in format 'YYYY-MM'
            
        Returns:
            API response data or None if request fails
        """
        query = f"""select metadata.station_name, metadata.station_code, metadata.state_name, 
                   metadata.district_name, metadata.basin_name, metadata.sub_basin_name,
                   ROUND(avg(businessdata.level):: numeric, 2) as avglevel, 
                   ROUND(min(businessdata.level):: numeric, 2) as minlevel, 
                   ROUND(max(businessdata.level):: numeric, 2) as maxlevel 
                   FROM public.groundwater_station as metadata 
                   INNER JOIN public.gwl_timeseries_data as businessdata 
                   on metadata.station_code = businessdata.station_code 
                   where metadata.station_code = '{station_code}' 
                   and to_char(date, 'yyyy-mm-dd') between '{start_date}' and '{end_date}' 
                   group by metadata.station_name, metadata.station_code, metadata.state_name, 
                   metadata.district_name, metadata.basin_name, metadata.sub_basin_name"""
        
        payload = {
            "stnVal": {
                "qry": query
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                logger.info(f"Successfully fetched data for station {station_code}")
                return data
                
        except httpx.RequestError as e:
            logger.error(f"Request error fetching data for station {station_code}: {e}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching data for station {station_code}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching data for station {station_code}: {e}")
            return None
    
    async def fetch_monthly_groundwater_data(self, station_code: str, start_date: str, end_date: str) -> Optional[List[Dict]]:
        """
        Fetch monthly average groundwater data for given station and date range.
        
        Args:
            station_code: Station code to fetch data for
            start_date: Start date in format 'YYYY-MM'
            end_date: End date in format 'YYYY-MM'
            
        Returns:
            List of monthly data or None if request fails
        """
        query = f"""select extract(year from date) as year, extract(month from date) as month,
                   ROUND(avg(businessdata.level):: numeric, 2) as avg_level,
                   ROUND(min(businessdata.level):: numeric, 2) as min_level,
                   ROUND(max(businessdata.level):: numeric, 2) as max_level,
                   count(*) as data_points
                   FROM public.groundwater_station as metadata 
                   INNER JOIN public.gwl_timeseries_data as businessdata 
                   on metadata.station_code = businessdata.station_code 
                   where metadata.station_code = '{station_code}' 
                   and to_char(date, 'yyyy-mm-dd') between '{start_date}' and '{end_date}' 
                   group by extract(year from date), extract(month from date)
                   order by year, month"""
        
        payload = {
            "stnVal": {
                "qry": query
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                logger.info(f"Successfully fetched monthly data for station {station_code}")
                return data
                
        except Exception as e:
            logger.error(f"Error fetching monthly data for station {station_code}: {e}")
            return None
    
    async def get_groundwater_level_data(self, latitude: float, longitude: float) -> Dict:
        """
        Main method to get groundwater level data for given coordinates.
        
        Args:
            latitude: Target latitude
            longitude: Target longitude
            
        Returns:
            Dictionary containing groundwater data and analysis
        """
        # Find nearest station
        nearest_station = self.find_nearest_station(latitude, longitude)
        if not nearest_station:
            return {
                "error": "No nearby groundwater monitoring station found",
                "latitude": latitude,
                "longitude": longitude
            }
        
        station_code = nearest_station["station_code"]
        
        # Try to fetch data for 2024-01 to 2025-01
        data_2024 = await self.fetch_groundwater_data(station_code, "2024-01", "2025-01")
        monthly_data_2024 = await self.fetch_monthly_groundwater_data(station_code, "2024-01", "2025-01")
        
        result = {
            "input_coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "nearest_station": nearest_station,
            "data_availability": {},
            "groundwater_analysis": {}
        }
        
        # Check if 2024 data is available and has meaningful content
        if data_2024 and self._has_valid_data(data_2024):
            result["data_availability"]["2024_data"] = True
            result["groundwater_analysis"]["period"] = "2024-01 to 2025-01"
            result["groundwater_analysis"]["annual_summary"] = data_2024
            result["groundwater_analysis"]["monthly_data"] = monthly_data_2024
        else:
            # Fallback to 2023 data
            logger.info(f"No valid 2024 data found for station {station_code}, trying 2023 data")
            data_2023 = await self.fetch_groundwater_data(station_code, "2023-01", "2024-01")
            monthly_data_2023 = await self.fetch_monthly_groundwater_data(station_code, "2023-01", "2024-01")
            
            if data_2023 and self._has_valid_data(data_2023):
                result["data_availability"]["2024_data"] = False
                result["data_availability"]["2023_data"] = True
                result["groundwater_analysis"]["period"] = "2023-01 to 2024-01"
                result["groundwater_analysis"]["annual_summary"] = data_2023
                result["groundwater_analysis"]["monthly_data"] = monthly_data_2023
            else:
                result["error"] = "No valid groundwater data found for recent years"
                result["data_availability"]["2024_data"] = False
                result["data_availability"]["2023_data"] = False
        
        return result
    
    def _has_valid_data(self, api_response: Dict) -> bool:
        """
        Check if API response contains valid groundwater data.
        
        Args:
            api_response: Response from the API
            
        Returns:
            True if response contains valid data, False otherwise
        """
        try:
            # Check if response has data and it's not empty
            if not api_response:
                return False
                
            # Check for common response structures
            if 'data' in api_response and api_response['data']:
                return True
            elif 'result' in api_response and api_response['result']:
                return True
            elif isinstance(api_response, list) and len(api_response) > 0:
                return True
            elif isinstance(api_response, dict) and len(api_response) > 0:
                # Check if it has meaningful keys beyond just metadata
                meaningful_keys = ['avglevel', 'minlevel', 'maxlevel', 'level']
                return any(key in str(api_response).lower() for key in meaningful_keys)
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking data validity: {e}")
            return False

# Global instance
groundwater_service = GroundWaterLevelService()