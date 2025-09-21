#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.main import app
from fastapi.testclient import TestClient
import traceback

client = TestClient(app)

# Make the actual request that's failing
try:
    response = client.post('/', json={
        'address': 'Test Address, Mumbai, Maharashtra, India',
        'area_sqm': 150,
        'rooftop_area_sqm': 100,
        'phone': '9876543210',
        'pincode': '400001',
        'water_source': 'Municipal',
        'water_bill': 2000
    })

    print(f'Response status: {response.status_code}')
    if response.status_code == 200:
        print(f'Response data keys: {response.json().keys()}')
        print('AI recommendations present:', 'ai_recommendations' in response.json())
    else:
        print('Error response:', response.json())
        
except Exception as e:
    print(f'Exception occurred: {e}')
    traceback.print_exc()