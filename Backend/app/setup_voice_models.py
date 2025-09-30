"""
Voice Models Setup Script
Downloads and sets up Vosk models for English and Hindi speech recognition
"""

import os
import requests
import zipfile
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model download URLs
MODELS = {
    "vosk-model-small-en-us-0.15": {
        "url": "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip",
        "name": "English (US) Small Model"
    },
    "vosk-model-small-hi-0.22": {
        "url": "https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip", 
        "name": "Hindi Small Model"
    }
}

def download_file(url: str, filename: str) -> bool:
    """Download a file from URL"""
    try:
        logger.info(f"Downloading {filename}...")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded_size = 0
        
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        print(f"\rProgress: {progress:.1f}%", end='', flush=True)
        
        print()  # New line after progress
        logger.info(f"Successfully downloaded {filename}")
        return True
        
    except Exception as e:
        logger.error(f"Error downloading {filename}: {e}")
        return False

def extract_zip(zip_path: str, extract_to: str) -> bool:
    """Extract ZIP file"""
    try:
        logger.info(f"Extracting {zip_path}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        
        logger.info(f"Successfully extracted to {extract_to}")
        return True
        
    except Exception as e:
        logger.error(f"Error extracting {zip_path}: {e}")
        return False

def setup_voice_models():
    """Main setup function"""
    # Get the directory where this script is located
    base_dir = Path(__file__).parent
    models_dir = base_dir / "chatbot" / "multilingual"
    
    # Create models directory if it doesn't exist
    models_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Setting up voice models in: {models_dir}")
    
    for model_name, model_info in MODELS.items():
        model_path = models_dir / model_name
        
        # Check if model already exists
        if model_path.exists() and model_path.is_dir():
            logger.info(f"{model_info['name']} already exists, skipping...")
            continue
        
        # Download model
        zip_filename = f"{model_name}.zip"
        zip_path = models_dir / zip_filename
        
        if download_file(model_info["url"], str(zip_path)):
            # Extract model
            if extract_zip(str(zip_path), str(models_dir)):
                # Remove zip file after extraction
                try:
                    os.remove(zip_path)
                    logger.info(f"Removed temporary file: {zip_filename}")
                except Exception as e:
                    logger.warning(f"Could not remove {zip_filename}: {e}")
                
                logger.info(f"✅ {model_info['name']} setup complete")
            else:
                logger.error(f"❌ Failed to extract {model_info['name']}")
        else:
            logger.error(f"❌ Failed to download {model_info['name']}")
    
    logger.info("Voice models setup complete!")
    
    # Verify models
    logger.info("Verifying installed models...")
    for model_name in MODELS.keys():
        model_path = models_dir / model_name
        if model_path.exists() and model_path.is_dir():
            logger.info(f"✅ {model_name} - OK")
        else:
            logger.warning(f"❌ {model_name} - Missing")

if __name__ == "__main__":
    setup_voice_models()