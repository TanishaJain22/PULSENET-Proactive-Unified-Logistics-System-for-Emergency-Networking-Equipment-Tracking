#!/usr/bin/env python3
"""
Startup script for PulseNet AI Service
This script ensures all dependencies are installed and starts the FastAPI service
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install required packages"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_model_exists():
    """Check if the XGBoost model file exists"""
    model_path = Path("models/hospital_assignment_model_xgb.pkl")
    if model_path.exists():
        print(f"✅ XGBoost model found: {model_path}")
        return True
    else:
        print(f"⚠️  XGBoost model not found: {model_path}")
        print("   The service will use fallback predictions")
        return False

def start_service():
    """Start the FastAPI service"""
    print("Starting PulseNet AI Service...")
    print("🚀 Service will be available at: http://127.0.0.1:8000")
    print("📖 API documentation at: http://127.0.0.1:8000/docs")
    print("🔍 Health check at: http://127.0.0.1:8000/health")
    print("\nPress Ctrl+C to stop the service\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "api:app", 
            "--host", "127.0.0.1", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Failed to start service: {e}")

def main():
    print("🏥 PulseNet AI Hospital Recommendation Service")
    print("=" * 50)
    
    # Change to ml directory if not already there
    if not os.path.exists("api.py"):
        if os.path.exists("ml/api.py"):
            os.chdir("ml")
            print("📁 Changed to ml directory")
        else:
            print("❌ Could not find api.py file")
            sys.exit(1)
    
    # Install dependencies
    if not install_requirements():
        sys.exit(1)
    
    # Check model
    check_model_exists()
    
    # Start service
    start_service()

if __name__ == "__main__":
    main()