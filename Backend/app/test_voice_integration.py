"""
Test script to verify voice integration setup
"""

import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.voice_service import voice_service

async def test_voice_service():
    """Test voice service functionality"""
    print("🎤 Testing Voice Service Integration")
    print("=" * 50)
    
    # Test 1: Check available languages
    print("\n1. Available Languages:")
    languages = voice_service.get_available_languages()
    if languages:
        for code, name in languages.items():
            print(f"   ✅ {code}: {name}")
    else:
        print("   ❌ No languages available!")
        return False
    
    # Test 2: Check model loading
    print("\n2. Model Status:")
    for lang_code in ['en', 'hi']:
        if voice_service.is_language_supported(lang_code):
            print(f"   ✅ {lang_code}: Model loaded")
        else:
            print(f"   ❌ {lang_code}: Model not available")
    
    # Test 3: Check model files
    print("\n3. Model Files:")
    base_dir = Path(__file__).parent / "chatbot" / "multilingual"
    
    expected_models = [
        "vosk-model-small-en-us-0.15",
        "vosk-model-small-hi-0.22"
    ]
    
    for model_name in expected_models:
        model_path = base_dir / model_name
        if model_path.exists() and model_path.is_dir():
            print(f"   ✅ {model_name}: Found at {model_path}")
        else:
            print(f"   ❌ {model_name}: Missing at {model_path}")
    
    print("\n" + "=" * 50)
    
    if len(languages) >= 1:
        print("✅ Voice service setup appears to be working!")
        print("\nNext steps:")
        print("1. Start the backend server: uvicorn app.main:app --reload")
        print("2. Test the voice endpoints via the frontend")
        print("3. Grant microphone permissions when prompted")
        return True
    else:
        print("❌ Voice service setup incomplete!")
        print("\nTo fix:")
        print("1. Run: python setup_voice_models.py")
        print("2. Check internet connection")
        print("3. Verify model files are downloaded")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_voice_service())
    sys.exit(0 if result else 1)