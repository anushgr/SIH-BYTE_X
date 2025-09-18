import geopandas as gpd
import pandas as pd

# Load the GeoJSON file
# Replace 'Major_Aquifers.geojson' with the path to your GeoJSON file
try:
    gdf = gpd.read_file('Major Aquifers.geojson')
except Exception as e:
    print(f"Error loading GeoJSON file: {str(e)}")
    exit()

def extract_aquifer_types():
    # Check if required columns exist
    required_columns = ['aquifer', 'newcode14', 'newcode43']
    available_columns = [col for col in required_columns if col in gdf.columns]
    
    if not available_columns:
        print("None of the expected columns ('aquifer', 'newcode14', 'newcode43') found in the GeoJSON.")
        return
    
    # Extract unique values for each available column
    unique_values = {}
    for col in available_columns:
        unique_values[col] = gdf[col].dropna().unique().tolist()
    
    # Print unique values for each column
    print("\nUnique Aquifer Types and Codes:")
    for col, values in unique_values.items():
        print(f"\n{col}:")
        for value in sorted(values):  # Sort for readability
            print(f"  - {value}")
    
    # Summarize combinations of aquifer, newcode14, and newcode43 (if all exist)
    if all(col in gdf.columns for col in required_columns):
        print("\nSummary of Aquifer Type Combinations:")
        # Group by the three columns and count occurrences
        combinations = gdf.groupby(['aquifer', 'newcode14', 'newcode43']).size().reset_index(name='count')
        for _, row in combinations.iterrows():
            print(f"Aquifer: {row['aquifer']}, newcode14: {row['newcode14']}, newcode43: {row['newcode43']}, Count: {row['count']}")
    else:
        print("\nNote: Could not summarize combinations because not all columns ('aquifer', 'newcode14', 'newcode43') are present.")

def main():
    try:
        extract_aquifer_types()
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()