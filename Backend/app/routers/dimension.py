from fastapi import APIRouter
from pydantic import BaseModel

class DimensionRequest(BaseModel):
    structure_type: str
    runoff_volume: float

class DimensionResponse(BaseModel):
    length_m: float
    width_m: float
    depth_m: float
    notes: str

router = APIRouter(prefix="/dimension", tags=["Dimension"])

@router.post("/recommend", response_model=DimensionResponse)
def recommend_dimensions(data: DimensionRequest):
    # Calculate recommended dimensions based on runoff volume
    if data.structure_type == "pit":
        # Assume pit: square, depth based on volume (2x2m area)
        length, width = 2, 2
        depth = data.runoff_volume / (length * width * 1000)  # m (assuming 1000L/m3)
        notes = "Pit: 2x2m area, depth calculated for runoff."
    elif data.structure_type == "trench":
        # Trench: 5x1m area
        length, width = 5, 1
        depth = data.runoff_volume / (length * width * 1000)
        notes = "Trench: 5x1m area, depth calculated for runoff."
    else:
        # Shaft: 1x1m area
        length, width = 1, 1
        depth = data.runoff_volume / (length * width * 1000)
        notes = "Shaft: 1x1m area, depth calculated for runoff."
    return DimensionResponse(length_m=length, width_m=width, depth_m=depth, notes=notes)
