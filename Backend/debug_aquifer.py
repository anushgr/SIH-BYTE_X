import sys
import os

# Add the Backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.enhanced_aquifer_service import enhanced_aquifer_service

# Test coordinates
lat = 12.917624
lon = 77.513119

print("Testing enhanced aquifer service...")
result = enhanced_aquifer_service.find_aquifer(lat, lon)

if result:
    print(f"Found {len(result)} aquifer(s)")
    for i, aquifer in enumerate(result):
        print(f"\nAquifer {i+1}:")
        print(f"  Basic info: {aquifer.get('basic_info', {})}")
        print(f"  Water characteristics: {aquifer.get('water_characteristics', {})}")
else:
    print("No aquifers found")

# Let's also test the raw data
print("\n" + "="*50)
print("Testing raw aquifer service...")
from app.aquifer_service import aquifer_service

raw_result = aquifer_service.find_aquifer(lat, lon)
if raw_result:
    print(f"Found {len(raw_result)} raw aquifer(s)")
    for i, aquifer in enumerate(raw_result):
        print(f"\nRaw Aquifer {i+1}:")
        for key, value in aquifer.items():
            print(f"  {key}: {value}")
else:
    print("No raw aquifers found")