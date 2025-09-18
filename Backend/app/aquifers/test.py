import geopandas as gpd
from shapely.geometry import Point

# Load the GeoJSON file
# Replace 'Major_Aquifers.geojson' with the path to your GeoJSON file
gdf = gpd.read_file('Major Aquifers.geojson')

# Ensure the GeoJSON is in EPSG:4326 (latitude/longitude)
if gdf.crs is None or gdf.crs != 'EPSG:4326':
    gdf = gdf.set_crs('EPSG:4326')

def find_aquifer(latitude, longitude):
    # Create a Point geometry from the input coordinates
    point = Point(longitude, latitude)  # Note: Point takes (x, y) -> (longitude, latitude)
    
    # Create a GeoDataFrame with the input point
    point_gdf = gpd.GeoDataFrame(geometry=[point], crs='EPSG:4326')
    
    # Find aquifers that contain the point
    matching_aquifers = gdf[gdf.geometry.contains(point)]
    
    if not matching_aquifers.empty:
        # Extract properties of matching aquifers
        results = []
        for _, row in matching_aquifers.iterrows():
            aquifer_data = row.drop('geometry').to_dict()  # Exclude geometry, include all properties
            results.append(aquifer_data)
        return results
    else:
        return None

def main():
    try:
        # Get user input for latitude and longitude
        lat = float(input("Enter latitude (e.g., 34.0522): "))
        lon = float(input("Enter longitude (e.g., -118.2437): "))
        
        # Find aquifers at the given point
        result = find_aquifer(lat, lon)
        
        if result:
            print("\nAquifer(s) found at the given location:")
            for aquifer in result:
                print("\nAquifer properties:")
                for key, value in aquifer.items():
                    print(f"{key}: {value}")
        else:
            print("\nNo aquifers found at the given location.")
            
    except ValueError:
        print("Error: Please enter valid numeric values for latitude and longitude.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()