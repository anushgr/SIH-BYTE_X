from fastapi import APIRouter
from pydantic import BaseModel

class RunoffRequest(BaseModel):
    rooftop_area: float
    rainfall_mm: float
    runoff_coeff: float

class RunoffResponse(BaseModel):
    runoff_volume: float

router = APIRouter(prefix="/runoff", tags=["Runoff"])

@router.post("/generate", response_model=RunoffResponse)
def generate_runoff(data: RunoffRequest):
    # Calculate runoff in liters
    runoff_volume = data.rooftop_area * data.rainfall_mm * data.runoff_coeff * 0.001
    return RunoffResponse(runoff_volume=runoff_volume)
