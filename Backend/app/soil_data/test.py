import rasterio
import geopandas as gpd
from pyproj import Transformer

# ----------------------------
# Load raster
# ----------------------------
raster = rasterio.open("SOILTEXTURE.tif")

# Load soil attribute table (DBF file)
soil_attr = gpd.read_file("SOILTEXTURE.tif.vat.dbf")
print("Soil classes:\n", soil_attr.head(), "\n")

# Transformer: WGS84 (lat/lon) → raster CRS (Lambert Conformal Conic here)
transformer = Transformer.from_crs("EPSG:4326", raster.crs, always_xy=True)

def get_soil_type(lat, lon):
    """
    Given a latitude and longitude in WGS84,
    return the soil type information from the raster.
    """
    # Step 1: Reproject lon/lat → raster CRS
    x, y = transformer.transform(lon, lat)

    # Step 2: Convert to raster pixel (row, col)
    row, col = raster.index(x, y)

    # Step 3: Bounds check
    if row < 0 or row >= raster.height or col < 0 or col >= raster.width:
        return {"error": "Point is outside raster extent"}

    # Step 4: Get raster value at pixel
    soil_code = raster.read(1)[row, col]

    # Step 5: Match raster value to soil attribute table
    match = soil_attr[soil_attr["value"] == soil_code]

    if not match.empty:
        return match.to_dict(orient="records")[0]
    else:
        return {"soil_code": soil_code, "soil_type": "Unknown"}


if __name__ == "__main__":
    # Example point: New Delhi
    lat, lon = 28.61, 77.20

    soil_info = get_soil_type(lat, lon)
    print("Soil at location (lat=%.4f, lon=%.4f):" % (lat, lon))
    print(soil_info)
