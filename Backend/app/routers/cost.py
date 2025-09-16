from fastapi import APIRouter
from pydantic import BaseModel

class CostRequest(BaseModel):
    structure_type: str
    dimensions: dict

class CostResponse(BaseModel):
    estimated_cost: float
    benefit: str

router = APIRouter(prefix="/cost", tags=["Cost"])

@router.post("/estimate", response_model=CostResponse)
def estimate_cost(data: CostRequest):
    # Calculate cost based on dimensions
    base_cost = 5000
    if data.structure_type == "pit":
        # Cost = base + 200/depth + 100/area
        cost = base_cost + 200 * data.dimensions.get("depth_m", 1) + 100 * data.dimensions.get("length_m", 1) * data.dimensions.get("width_m", 1)
    elif data.structure_type == "trench":
        cost = base_cost + 150 * data.dimensions.get("depth_m", 1) + 80 * data.dimensions.get("length_m", 1) * data.dimensions.get("width_m", 1)
    else:
        cost = base_cost + 300 * data.dimensions.get("depth_m", 1) + 120 * data.dimensions.get("length_m", 1) * data.dimensions.get("width_m", 1)
    benefit = "Reduces water bills, improves groundwater." if cost < 20000 else "High cost, but long-term benefit."
    return CostResponse(estimated_cost=cost, benefit=benefit)
