from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import torch
from sentence_transformers import SentenceTransformer
from contextlib import asynccontextmanager

# Import your SEGBOT model and preprocessing
from .model import SEGBOT, DEVICE
from .preprocess_transcript import preprocess_transcript

# --- 1. Data Models for Request and Response ---

class SegmentationRequest(BaseModel):
    transcript: str = Field(..., example="[00:00.000 --> 00:05.000] This is the first sentence.\n[00:05.000 --> 00:10.000] This is the second sentence.")

class Segment(BaseModel):
    text: str
    start_time: float
    end_time: float

# --- 2. Model Loading ---

# Use a dictionary to hold the models, which FastAPI will manage
model_cache = {}

# Use FastAPI's lifespan event manager to load models on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models only once when the application starts
    print("Loading models...")
    print(f"Using device: {DEVICE}")
    
    # Load the sentence embedding model and move to correct device
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2', device=str(DEVICE))
    model_cache["embedding_model"] = embedding_model
    
    # Load your SEGBOT model with explicit device
    # Adjust input_dim to match the output of the embedding model (384 for all-MiniLM-L6-v2)
    input_dim = 384
    hidden_dim = 256
    segbot_model = SEGBOT(input_dim, hidden_dim, device=DEVICE)
    
    # If you have pre-trained weights, load them here:
    # try:
    #     segbot_model.load_state_dict(torch.load("path/to/your/segbot_weights.pth", map_location=DEVICE))
    # except FileNotFoundError:
    #     print("Warning: SEGBOT model weights not found. Using randomly initialized weights.")
    
    segbot_model.eval()  # Set the model to evaluation mode
    model_cache["segbot_model"] = segbot_model
    print("Models loaded successfully.")
    
    yield
    
    # Clean up the models when the application is shutting down
    model_cache.clear()

app = FastAPI(lifespan=lifespan)

# --- 3. API Endpoint ---

@app.post("/segment", response_model=List[Segment])
async def create_segmentation(request: SegmentationRequest):
    """
    Accepts raw transcript text, preprocesses it, and returns a list of coherent segments.
    """
    embedding_model = model_cache["embedding_model"]
    segbot_model = model_cache["segbot_model"]

    if not request.transcript or not request.transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcript text is required and must not be empty."
        )

    try:
        print(f"Processing transcript with {len(request.transcript)} characters...")
        
        # --- A. Preprocess the transcript ---
        sentences, tokens, timestamps = preprocess_transcript(request.transcript)
        print(f"Preprocessed: {len(sentences)} sentences, {len(tokens)} tokens")
        
        if len(sentences) != len(timestamps):
            raise HTTPException(
                status_code=400,
                detail="The number of sentences must match the number of timestamps after preprocessing."
            )

        if len(sentences) == 0:
            raise HTTPException(
                status_code=400,
                detail="No valid sentences found in transcript. Please check the transcript format."
            )

        # --- B. Generate Embeddings ---
        print("Generating embeddings...")
        embeddings = embedding_model.encode(sentences, convert_to_tensor=True, device=str(DEVICE))
        
        # Ensure embeddings are on the correct device
        embeddings = embeddings.to(DEVICE)
        
        # Reshape for SEGBOT: (batch_size, sequence_length, input_dim)
        x = embeddings.unsqueeze(0) 
        print(f"Embeddings shape: {x.shape}, device: {x.device}")

        # --- C. Run SEGBOT Model ---
        print("Running SEGBOT model...")
        start_units = 0  # Assuming segmentation starts from the first sentence
        
        with torch.no_grad():  # Disable gradient computation for inference
            attention_weights = segbot_model(x, start_units)
        
        print(f"Attention weights shape: {attention_weights.shape}")
        
        # --- D. Get Segments ---
        print("Generating segments...")
        segments_data = segbot_model.segment_text(sentences, tokens, timestamps, attention_weights)

        if not segments_data:
            # Return entire transcript as single segment if segmentation fails
            return [Segment(
                text=" ".join(sentences),
                start_time=timestamps[0][0] if timestamps else 0.0,
                end_time=timestamps[-1][1] if timestamps else 1.0
            )]
        
        print(f"Generated {len(segments_data)} segments")
        return [Segment(**s) for s in segments_data]

    except Exception as e:
        print(f"Error during segmentation: {str(e)}")
        import traceback
        traceback.print_exc()
        # Catch potential runtime errors from the model or preprocessing
        raise HTTPException(status_code=500, detail=f"An error occurred during segmentation: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Segmentation API", "device": str(DEVICE)}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "device": str(DEVICE),
        "models_loaded": len(model_cache) > 0
    }
