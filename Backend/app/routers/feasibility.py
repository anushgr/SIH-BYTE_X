from fastapi import APIRouter
from pydantic import BaseModel

class FeasibilityRequest(BaseModel):
    rooftop_area: float
    rainfall_mm: float
    runoff_coeff: float

class FeasibilityResponse(BaseModel):
    feasible: bool
    message: str
    estimated_runoff: float

router = APIRouter(prefix="/feasibility", tags=["Feasibility"])

@router.post("/check", response_model=FeasibilityResponse)
def check_feasibility(data: FeasibilityRequest):
    estimated_runoff = data.rooftop_area * data.rainfall_mm * data.runoff_coeff * 0.001
    feasible = estimated_runoff > 1000  # Example threshold
    message = "Feasible for rainwater harvesting." if feasible else "Not feasible. Increase catchment or check runoff coefficient."
    return FeasibilityResponse(feasible=feasible, message=message, estimated_runoff=estimated_runoff)
