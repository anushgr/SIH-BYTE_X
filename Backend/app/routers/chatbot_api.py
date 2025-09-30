"""
Chatbot API Router
Provides endpoints for the RAG-based chatbot functionality
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict
import logging
from ..chatbot_service import chatbot_service
from ..voice_service import voice_service

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

class VoiceRequest(BaseModel):
    language: str = "en"

class VoiceResponse(BaseModel):
    success: bool
    transcribed_text: str
    message: str

class VoiceLanguagesResponse(BaseModel):
    languages: Dict[str, str]

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

@router.post("/voice/transcribe", response_model=VoiceResponse)
async def transcribe_voice(
    file: UploadFile = File(...),
    language: str = "en"
):
    """
    Transcribe voice audio to text
    Supports English ('en') and Hindi ('hi')
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read audio data
        audio_data = await file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")
        
        # Transcribe audio
        success, result = await voice_service.transcribe_audio(audio_data, language)
        
        if success:
            return VoiceResponse(
                success=True,
                transcribed_text=result,
                message="Transcription successful"
            )
        else:
            return VoiceResponse(
                success=False,
                transcribed_text="",
                message=result
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in voice transcription: {str(e)}")
        raise HTTPException(status_code=500, detail="Voice transcription failed")

@router.get("/voice/languages", response_model=VoiceLanguagesResponse)
async def get_supported_languages():
    """
    Get list of supported languages for voice recognition
    """
    try:
        languages = voice_service.get_available_languages()
        return VoiceLanguagesResponse(languages=languages)
    except Exception as e:
        logger.error(f"Error getting supported languages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get supported languages")

@router.post("/voice/chat", response_model=ChatResponse)
async def voice_chat(
    file: UploadFile = File(...),
    language: str = "en"
):
    """
    Complete voice-to-chat flow: transcribe voice and get chatbot response
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read audio data
        audio_data = await file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")
        
        # Transcribe audio
        success, transcribed_text = await voice_service.transcribe_audio(audio_data, language)
        
        if not success:
            raise HTTPException(status_code=400, detail=f"Transcription failed: {transcribed_text}")
        
        if not transcribed_text.strip():
            raise HTTPException(status_code=400, detail="No speech detected in audio")
        
        # Get chatbot response
        result = await chatbot_service.get_response(transcribed_text.strip())
        
        return ChatResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in voice chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Voice chat failed")