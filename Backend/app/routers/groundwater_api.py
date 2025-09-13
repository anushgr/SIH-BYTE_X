from fastapi import APIRouter, Query
import requests

router = APIRouter(prefix="/groundwater_api", tags=["Groundwater API"])

@router.get("/level")
def get_groundwater_level(state: str = Query(...), district: str = Query(...), block: str = Query(...)):
    """
    Fetch groundwater level from India-WRIS API.
    """
    url = "https://indiawris.gov.in/api/getGroundWaterLevel"
    params = {
        "state": state,
        "district": district,
        "block": block
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to fetch data", "status_code": response.status_code}
