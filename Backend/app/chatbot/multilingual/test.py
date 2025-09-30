from vosk import Model, KaldiRecognizer
import pyaudio
import json
import os

# Available language models
models = {
    "1": {"path": "vosk-model-small-en-us-0.15", "name": "English (US)"},
    "2": {"path": "vosk-model-small-hi-0.22", "name": "Hindi (Small)"}
}

# Display available models
print("Available language models:")
for key, model_info in models.items():
    print(f"{key}. {model_info['name']}")

# Get user choice
while True:
    choice = input("Select language model (1-2): ").strip()
    if choice in models:
        break
    print("Invalid choice. Please select 1 or 2.")

selected_model = models[choice]
model_path = selected_model["path"]

print(f"Loading {selected_model['name']} model...")

if not os.path.exists(model_path):
    print(f"Model not found at {model_path}")
    exit(1)

model = Model(model_path)

rec = KaldiRecognizer(model, 16000)

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000,
                input=True, frames_per_buffer=8000)
stream.start_stream()

print(f"🎤 Speak something in {selected_model['name']}...")
print("(Press Ctrl+C to stop)")

try:
    while True:
        data = stream.read(4000, exception_on_overflow = False)
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            text = result.get("text", "")
            if text.strip():  # Only print non-empty results
                print(f"[{selected_model['name']}] You said: {text}")
except KeyboardInterrupt:
    print("\n🛑 Stopping speech recognition...")
    stream.stop_stream()
    stream.close()
    p.terminate()
