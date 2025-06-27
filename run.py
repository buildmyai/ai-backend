#!/usr/bin/env python3
"""
AI Solutions Backend Startup Script
"""
import uvicorn
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    """Start the FastAPI application"""
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Import and setup database
    try:
        from database import create_tables
        create_tables()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"⚠️  Database setup warning: {e}")
    
    # Configuration
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"🚀 Starting AI Solutions Backend...")
    print(f"📍 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    print(f"🔧 Debug Mode: {debug}")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning"
    )

if __name__ == "__main__":
    main()
