from fastapi import FastAPI
from app.routers.feasibility import router as feasibility_router
from app.routers.structure import router as structure_router
from app.routers.aquifer import router as aquifer_router
from app.routers.groundwater import router as groundwater_router
from app.routers.rainfall import router as rainfall_router
from app.routers.runoff import router as runoff_router
from app.routers.dimension import router as dimension_router

from app.routers.cost import router as cost_router
from app.routers.groundwater_api import router as groundwater_api_router

app = FastAPI(title="SIH BYTE_X Backend")

app.include_router(feasibility_router)
app.include_router(structure_router)
app.include_router(aquifer_router)
app.include_router(groundwater_router)
app.include_router(rainfall_router)
app.include_router(runoff_router)
app.include_router(dimension_router)

app.include_router(cost_router)
app.include_router(groundwater_api_router)
