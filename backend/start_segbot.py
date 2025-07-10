#!/usr/bin/env python3
"""
SEGBOT API Server Startup Script
"""
import uvicorn
import sys
import os

# Add the backend directory to Python path so imports work
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

if __name__ == "__main__":
    print("🚀 Starting SEGBOT API Server...")
    print("🔧 Segment endpoint: http://localhost:8000/segment")
    
    
    uvicorn.run(
        "segmentation.segmentation_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )