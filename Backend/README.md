# SIH BYTE_X Backend

This is a simple FastAPI backend for the SIH BYTE_X project. It provides endpoints for feasibility checks and recommendations related to rooftop rainwater harvesting (RTRWH) and artificial recharge structures. No database integration is required; all data is processed via API calls.

## Features

- Feasibility check for rooftop rainwater harvesting
- Suggestions for RTRWH/Artificial Recharge structures
- Information on principal aquifer
- Groundwater level depth
- Local rainfall data
- Runoff generation capacity
- Recommended dimensions for recharge pits, trenches, shafts
- Cost estimation and cost-benefit analysis

## Project Structure

- `app/` - Contains feature-based FastAPI routers
- `main.py` - FastAPI app entry point

## Setup

1. Create a virtual environment:
   ```cmd
   python -m venv env
   env\Scripts\activate
   ```
2. Install dependencies:
   ```cmd
   pip install fastapi uvicorn
   ```
3. Run the server:
   ```cmd
   uvicorn app.main:app --reload
   ```

## API Endpoints

See each feature module in `app/` for endpoint details.
