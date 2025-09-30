"""
Voice Service for Multilingual Speech Recognition
Uses Vosk models for English and Hindi speech recognition
"""

import os
import json
import logging
import asyncio
import io
import wave
import tempfile
from typing import Dict, Optional, Tuple
from vosk import Model, KaldiRecognizer
import pyaudio

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.models = {}
        self.recognizers = {}
        
        # Available language models
        self.language_models = {
            "en": {
                "path": "vosk-model-small-en-us-0.15", 
                "name": "English (US)"
            },
            "hi": {
                "path": "vosk-model-small-hi-0.22", 
                "name": "Hindi (Small)"
            }
        }
        
        self._load_models()
    
    def _load_models(self):
        """Load available voice models"""
        base_path = os.path.join(os.path.dirname(__file__), "chatbot", "multilingual")
        
        for lang_code, model_info in self.language_models.items():
            model_path = os.path.join(base_path, model_info["path"])
            
            if os.path.exists(model_path):
                try:
                    logger.info(f"Loading {model_info['name']} model...")
                    model = Model(model_path)
                    recognizer = KaldiRecognizer(model, 16000)
                    
                    self.models[lang_code] = model
                    self.recognizers[lang_code] = recognizer
                    
                    logger.info(f"Successfully loaded {model_info['name']} model")
                except Exception as e:
                    logger.error(f"Failed to load {model_info['name']} model: {e}")
            else:
                logger.warning(f"Model not found at {model_path}")
    
    def get_available_languages(self) -> Dict[str, str]:
        """Get list of available languages"""
        return {
            lang_code: info["name"] 
            for lang_code, info in self.language_models.items() 
            if lang_code in self.models
        }
    
    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> Tuple[bool, str]:
        """
        Transcribe audio data to text
        
        Args:
            audio_data: WAV audio data as bytes
            language: Language code ('en' or 'hi')
            
        Returns:
            Tuple of (success: bool, transcribed_text: str)
        """
        try:
            if language not in self.recognizers:
                return False, f"Language '{language}' not supported or model not loaded"
            
            recognizer = self.recognizers[language]
            
            # Reset recognizer for new audio
            recognizer = KaldiRecognizer(self.models[language], 16000)
            
            # Process audio data
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Read WAV file and process
                with wave.open(temp_file_path, 'rb') as wf:
                    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
                        return False, "Audio must be mono, 16-bit, 16kHz WAV format"
                    
                    results = []
                    while True:
                        data = wf.readframes(4000)
                        if len(data) == 0:
                            break
                        
                        if recognizer.AcceptWaveform(data):
                            result = json.loads(recognizer.Result())
                            text = result.get("text", "").strip()
                            if text:
                                results.append(text)
                    
                    # Get final result
                    final_result = json.loads(recognizer.FinalResult())
                    text = final_result.get("text", "").strip()
                    if text:
                        results.append(text)
                    
                    transcribed_text = " ".join(results).strip()
                    
                    if transcribed_text:
                        return True, transcribed_text
                    else:
                        return False, "No speech detected"
                        
            finally:
                # Cleanup temporary file
                os.unlink(temp_file_path)
                
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return False, f"Transcription error: {str(e)}"
    
    def is_language_supported(self, language: str) -> bool:
        """Check if a language is supported"""
        return language in self.recognizers

# Global voice service instance
voice_service = VoiceService()