import whisper
import json
import sys
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class TranscriptionRequest(BaseModel):
    audio_path: str
    model_size: str = 'medium'
    language: str = 'English'
    save_json: bool = True

class TranscriptionResponse(BaseModel):
    text: str  # Full transcript text
    chunks: list  # Segments with timestamp arrays and text
    json_file_path: str = None

def transcribe_to_json(audio_path, model_size='medium', language='English', save_json=True):
    """
    Transcribe audio file using Whisper and return structured result matching the requested format
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    model = whisper.load_model(model_size)

    # Configure language parameter for whisper
    whisper_language = None
    if language.lower() == 'hindi':
        whisper_language = 'hi'
    elif language.lower() == 'english':
        whisper_language = 'en'
    else:
        whisper_language = 'en'  # Default to English

    # Transcribe the audio
    result = model.transcribe(audio_path, language=whisper_language)

    # Transform to the requested format
    formatted_result = {
        "text": result["text"],  # Full transcript text
        "chunks": []
    }
    
    # Convert segments to chunks format with timestamp arrays
    for segment in result.get("segments", []):
        chunk = {
            "timestamp": [segment["start"], segment["end"]],
            "text": segment["text"]
        }
        formatted_result["chunks"].append(chunk)

    # Save JSON file if requested
    json_file_path = None
    if save_json:
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        json_file_path = os.path.join(os.path.dirname(audio_path), base_name + "_transcript.json")
        
        try:
            with open(json_file_path, "w", encoding="utf-8") as f:
                json.dump(formatted_result, f, ensure_ascii=False, indent=2)
        except Exception as e:
            json_file_path = None

    return formatted_result, json_file_path

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcribe audio file and return formatted transcript in the requested JSON format
    """
    try:
        result, json_file_path = transcribe_to_json(
            request.audio_path, 
            request.model_size, 
            request.language,
            request.save_json
        )
        
        response = TranscriptionResponse(
            text=result["text"],
            chunks=result["chunks"],
            json_file_path=json_file_path
        )
        
        return response
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)