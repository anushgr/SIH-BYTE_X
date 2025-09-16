from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import smtplib
from typing import Optional
from email.message import EmailMessage

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# TODO: use environment variables
SMTP_USERNAME = "enter_mail_here"
SMTP_PASSWORD = "enter_password_here"

class AssessmentData(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

    address: str
    city: str
    state: str
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    dwellers: int
    roof_area: float
    roof_type: Optional[str] = None
    open_space: Optional[float] = None
    current_water_source: Optional[str] = None
    monthly_water_bill: Optional[float] = None

class EmailResponse(BaseModel):
    success: bool
    timestamp: str
    message: str

router = APIRouter(prefix="/email", tags=["Email"])

def create_email_body(data: AssessmentData):
    """
    Create the email body for the assessment data
    """
    
    body = f"""
PERSONAL INFORMATION:
- Name: {data.name}
- Email: {data.email}
- Phone: {data.phone or "Not provided"}

LOCATION DETAILS:
- Address: {data.address}
- City: {data.city}
- State: {data.state}
- PIN Code: {data.pincode or "Not provided"}
- GPS Coordinates: {f"{data.latitude:.6f}, {data.longitude:.6f}" if data.latitude and data.longitude else "Not provided"}

PROPERTY SPECIFICATIONS:
- Number of Dwellers: {data.dwellers}
- Roof Area: {data.roof_area} sq ft
- Roof Type: {data.roof_type or "Not specified"}
- Available Open Space: {data.open_space or "Not specified"} sq ft
- Current Water Source: {data.current_water_source or "Not specified"}
- Monthly Water Bill: ₹{data.monthly_water_bill or "Not provided"}
    """
    return body

@router.post("/send_assessment", response_model=EmailResponse)
async def send_assessment_mail(data: AssessmentData):
    """
    Send the assessment data entered by the user as mail
    """

    try:
        msg = EmailMessage()
        msg['Subject'] = "Rainwater Harvesting Assessment Report"
        msg['From'] = SMTP_USERNAME
        msg['To'] = data.email

        body = create_email_body(data)
        msg.set_content(body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        return EmailResponse(success=True, timestamp=datetime.now().isoformat(), message="Assessment data sent successfully")
    
    except Exception as e:

        return EmailResponse(success=False, timestamp=datetime.now().isoformat(), message=f"Error sending email: {str(e)}")