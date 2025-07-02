from fastapi import FastAPI, UploadFile, File, HTTPException
from scalar_fastapi import get_scalar_api_reference
from typing import List
from pydantic import BaseModel, Field
from services.segmentation_service import segment_transcript
from services.transcript_service import transcribe_to_json
from services.title_clustering import cluster_titles
import os


class ClusterRequest(BaseModel):
    titles: List[str] = Field(..., description="List of video titles to cluster")


class ClusterResponse(BaseModel):
    clusters: List[List[List[str]]] = Field(..., description="Nested structure of modules and sections containing video titles")
    message: str = Field(..., description="Success message")


class SegmentRequest(BaseModel):
    file_path: str
    lam: float = 3.0  # Lambda parameter with default value


class SegmentResponse(BaseModel):
    segments: dict
    segment_count: int
    message: str


class TranscribeRequest(BaseModel):
    audio_path: str
    model_size: str = "medium"
    language: str = "English"
    save_json: bool = True


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/reference", include_in_schema=False)
async def reference_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


@app.post("/cluster-titles", response_model=ClusterResponse)
async def cluster_titles_endpoint(request: ClusterRequest):
    """
    Cluster video titles into modules and sections for course organization.
    """
    try:
        if not request.titles:
            raise HTTPException(status_code=400, detail="No titles provided")
        
        # Use the clustering function
        clusters = cluster_titles(request.titles)
        
        return ClusterResponse(
            clusters=clusters,
            message=f"Successfully clustered {len(request.titles)} titles into {len(clusters)} modules"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during clustering: {str(e)}")


@app.post("/transcribe")
async def transcribe_audio_endpoint(request: TranscribeRequest):
    """
    Transcribe an audio file from a given path using the transcript service.
    """
    try:
        # Validate that the audio file exists
        if not os.path.exists(request.audio_path):
            raise HTTPException(status_code=404, detail=f"Audio file not found: {request.audio_path}")

        # Use the transcript service
        result, json_file_path = transcribe_to_json(
            request.audio_path, 
            request.model_size, 
            request.language,
            save_json=request.save_json
        )
        
        return {
            "text": result["text"],
            "chunks": result["chunks"],
            "json_file_path": json_file_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/segment-transcript", response_model=SegmentResponse)
async def segment_transcript_endpoint(request: SegmentRequest):
    """
    Segment transcript using the segmentation service.
    """
    try:
        # Validate that the file exists
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")

        # Use the segmentation service
        segments = segment_transcript(request.file_path, lam=request.lam)

        return SegmentResponse(
            segments=segments,
            segment_count=len(segments),
            message="Transcript segmentation completed successfully",
        )

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during segmentation: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)