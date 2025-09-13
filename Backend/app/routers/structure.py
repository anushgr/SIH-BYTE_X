from fastapi import APIRouter
from pydantic import BaseModel

class StructureRequest(BaseModel):
    rooftop_area: float
    soil_type: str

class StructureResponse(BaseModel):
    recommended_structure: str
    notes: str

router = APIRouter(prefix="/structure", tags=["Structure"])

@router.post("/suggest", response_model=StructureResponse)
def suggest_structure(data: StructureRequest):
    if data.soil_type.lower() in ["clay", "silt"]:
        structure = "Recharge pit"
        notes = "Suitable for low permeability soils."
    else:
        structure = "Recharge trench"
        notes = "Suitable for sandy or permeable soils."
    return StructureResponse(recommended_structure=structure, notes=notes)
