from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.rainfall_api import router as rainfall_router
from .routers.auth_api import router as auth_router
from .routers.assessment_api import router as assessment_router
from .routers.groundwater_api import router as groundwater_router
from .database import engine
from .models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SIH BYTE_X Backend", description="A fresh start for the SIH project backend", version="1.0.0")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rainfall_router)
app.include_router(auth_router)
app.include_router(assessment_router)
app.include_router(groundwater_router)

@app.get("/")
async def root():
    return {"message": "Welcome to SIH BYTE_X Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running successfully"}
