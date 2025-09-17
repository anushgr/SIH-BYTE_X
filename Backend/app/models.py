from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    dwellers = Column(Integer, nullable=False)
    roof_area = Column(Float, nullable=False)
    roof_type = Column(String, nullable=True)
    open_space = Column(Float, nullable=True)
    current_water_source = Column(String, nullable=True)
    monthly_water_bill = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    
    # Soil data fields
    soil_type = Column(String, nullable=True)
    soil_class = Column(String, nullable=True)
    soil_code = Column(Integer, nullable=True)
    soil_suitability = Column(String, nullable=True)  # Excellent, Very Good, Good, Fair, Moderate, Unknown
    soil_suitability_score = Column(Integer, nullable=True)  # 0-10 scale
    soil_infiltration_rate = Column(String, nullable=True)  # High, Moderate, Low
    soil_rwh_recommendations = Column(Text, nullable=True)  # JSON string of recommendations
    soil_data_error = Column(String, nullable=True)  # Error message if soil data extraction failed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())