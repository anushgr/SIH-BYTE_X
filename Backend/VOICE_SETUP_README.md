# Voice Assistant Integration Setup

This document explains how to set up the multilingual voice assistant integration for the chatbot.

## Features

- **Multilingual Support**: English and Hindi voice recognition
- **Real-time Recording**: Click-to-start, click-to-stop recording
- **Automatic Transcription**: Voice input automatically converts to text and sends to chatbot
- **Language Selection**: Switch between English and Hindi in the UI
- **Visual Feedback**: Recording status indicators and processing animations

## Backend Setup

### 1. Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Download Voice Models

Run the setup script to download Vosk models:

```bash
cd Backend/app
python setup_voice_models.py
```

This will download:
- `vosk-model-small-en-us-0.15` (English)
- `vosk-model-small-hi-0.22` (Hindi)

Models will be placed in: `Backend/app/chatbot/multilingual/`

### 3. Verify Installation

The voice service will automatically load available models on startup. Check the backend logs for:
- ✅ Model loading success messages
- ❌ Missing model warnings

## Frontend Setup

The frontend is already configured with:
- Voice recording UI components
- Audio processing utilities
- Language selection dropdown
- Recording status indicators

### Browser Requirements

- **HTTPS Required**: Voice recording only works over HTTPS or localhost
- **Modern Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Microphone Permissions**: Users must grant microphone access

## Usage

### For Users

1. **Open Chatbot**: Click the chat icon
2. **Select Language**: Choose English (EN) or Hindi (हिं) from dropdown
3. **Start Recording**: Click the microphone button (turns red when recording)
4. **Speak**: Say your question clearly
5. **Stop Recording**: Click the microphone button again
6. **Wait**: The system will transcribe and send to chatbot automatically

### Language Support

- **English (`en`)**: Uses `vosk-model-small-en-us-0.15`
- **Hindi (`hi`)**: Uses `vosk-model-small-hi-0.22`

## API Endpoints

### Voice Transcription
```http
POST /api/chatbot/voice/transcribe
Content-Type: multipart/form-data

file: audio_file.wav
language: en|hi
```

### Voice + Chat (Combined)
```http
POST /api/chatbot/voice/chat
Content-Type: multipart/form-data

file: audio_file.wav
language: en|hi
```

### Supported Languages
```http
GET /api/chatbot/voice/languages
```

## Troubleshooting

### Model Issues

**Problem**: "Model not found" errors
**Solution**: 
1. Run `python setup_voice_models.py` 
2. Check internet connection
3. Verify models exist in `Backend/app/chatbot/multilingual/`

### Audio Issues

**Problem**: "No speech detected"
**Solutions**:
- Ensure microphone permissions are granted
- Check microphone is working in other apps
- Try speaking louder or closer to microphone
- Use HTTPS (not HTTP) for web access

**Problem**: "Unable to access microphone"
**Solutions**:
- Grant microphone permissions in browser
- Use HTTPS or localhost (HTTP blocks microphone access)
- Check if another app is using the microphone

### Recording Issues

**Problem**: Recording doesn't start
**Solutions**:
- Check browser console for errors
- Verify AudioConverter.isSupported() returns true
- Try different browser
- Ensure secure context (HTTPS/localhost)

## File Structure

```
Backend/app/
├── voice_service.py           # Voice recognition service
├── setup_voice_models.py      # Model download script
├── routers/
│   └── chatbot_api.py        # Voice API endpoints
└── chatbot/multilingual/
    ├── vosk-model-small-en-us-0.15/  # English model
    └── vosk-model-small-hi-0.22/     # Hindi model

Frontend/byte_x/src/
├── components/
│   └── chatbot.tsx           # Updated chatbot with voice
└── utils/
    └── audioUtils.ts         # Audio processing utilities
```

## Configuration

### Backend Configuration

In `voice_service.py`, you can modify:
- Sample rate (default: 16000 Hz)
- Model paths
- Supported languages

### Frontend Configuration

In `chatbot.tsx`, you can adjust:
- Recording chunk size (default: 1000ms)
- Audio constraints (sample rate, channels)
- UI language labels

## Performance Notes

- **Model Size**: Small models (~50MB each) for faster loading
- **Processing Speed**: Transcription typically takes 1-3 seconds
- **Accuracy**: Small models provide good accuracy for basic conversations
- **Memory**: Each loaded model uses ~100-200MB RAM

## Security Considerations

- Voice data is processed locally (not sent to external services)
- Audio files are temporary (deleted after processing)
- HTTPS required for microphone access
- No voice data is stored permanently

## Future Enhancements

1. **Additional Languages**: Add more Vosk models
2. **Better Audio Processing**: Noise reduction, auto-gain
3. **Offline Mode**: Complete offline functionality
4. **Voice Synthesis**: Text-to-speech for responses
5. **Continuous Recognition**: Real-time transcription