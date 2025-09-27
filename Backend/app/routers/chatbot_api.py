"""
Chatbot API Router
Provides endpoints for the RAG-based chatbot functionality
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging
from ..chatbot_service import chatbot_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/chatbot",
    tags=["chatbot"],
    responses={404: {"description": "Not found"}},
)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    message: str
    response: str
    query: str

class StatusResponse(BaseModel):
    initialized: bool
    vectorstore_loaded: bool
    llm_loaded: bool
    vector_db_path: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """
    Send a message to the RAG chatbot and get a response
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get response from chatbot service
        result = await chatbot_service.get_response(request.message.strip())
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@router.get("/status", response_model=StatusResponse)
async def get_chatbot_status():
    """
    Get the current status of the chatbot service
    """
    try:
        status = chatbot_service.get_status()
        return StatusResponse(**status)
    except Exception as e:
        logger.error(f"Error getting chatbot status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get chatbot status")

@router.post("/initialize")
async def initialize_chatbot(background_tasks: BackgroundTasks):
    """
    Initialize the chatbot service (can be called manually if needed)
    """
    try:
        # Run initialization in background to avoid timeout
        background_tasks.add_task(chatbot_service.initialize)
        return {"message": "Chatbot initialization started in background"}
    except Exception as e:
        logger.error(f"Error initializing chatbot: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initialize chatbot")

@router.get("/health")
async def chatbot_health():
    """
    Simple health check for chatbot service
    """
    return {
        "status": "healthy",
        "service": "chatbot",
        "initialized": chatbot_service.is_initialized
    }