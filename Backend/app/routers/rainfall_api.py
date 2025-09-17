from fastapi import APIRouter, HTTPException, Query
from pydantic import Field
from typing import Annotated
from datetime import date
import httpx
import calendar
from collections import defaultdict

router = APIRouter(prefix="/rainfall_api", tags=["Rainfall API"])

def iso(d: date) -> str:
    return d.isoformat()
@router.get("/monthly-rainfall")
async def monthly_rainfall(
    latitude: Annotated[float, Field(ge=-90, le=90)] = Query(...),
    longitude: Annotated[float, Field(ge=-180, le=180)] = Query(...),
):
    """
    Get monthly rainfall data for the past year from Open-Meteo API.
    """
    today = date.today()

    year = today.year - 1
    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": iso(start_date),
        "end_date": iso(end_date),
        "daily": "rain_sum",
        "timezone": "UTC",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Open-Meteo request failed")
    data = resp.json()

    daily = data.get("daily", {})
    times = daily.get("time")
    rain = daily.get("rain_sum")
    if not times or rain is None:
        raise HTTPException(status_code=502, detail="Unexpected Open-Meteo response")

    monthly = defaultdict(float)
    for t, r in zip(times, rain):
        y, m, _ = t.split("-")
        key = int(m)
        monthly[key] += float(r or 0.0)

    results = []
    for m in range(1, 13):
        results.append({
            "year": year,
            "month": m,
            "month_name": calendar.month_name[m],
            "monthly_rain_mm": round(monthly.get(m, 0.0), 3)
        })

    return {
        "latitude": latitude,
        "longitude": longitude,
        "year": year,
        "units": "mm",
        "monthly": results
    }
