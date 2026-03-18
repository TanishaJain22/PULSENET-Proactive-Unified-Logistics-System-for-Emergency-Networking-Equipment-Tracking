#!/usr/bin/env python3
"""
Diagnostic script to check what's wrong with the Python service
"""

import sys
import os

def check_dependencies():
    """Check if all required packages are available"""
    print("🔍 Checking Python dependencies...")
    
    required_packages = [
        'fastapi', 'uvicorn', 'pydantic', 'numpy', 'pandas', 'joblib'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - MISSING")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("💡 Install with: pip install " + " ".join(missing))
        return False
    
    print("✅ All dependencies available")
    return True

def check_model_file():
    """Check if the model file exists and can be loaded"""
    print("\n🔍 Checking XGBoost model file...")
    
    model_paths = [
        "models/hospital_assignment_model_xgb.pkl",
        "ml/models/hospital_assignment_model_xgb.pkl"
    ]
    
    for path in model_paths:
        if os.path.exists(path):
            print(f"   ✅ Model file found: {path}")
            
            try:
                import joblib
                model = joblib.load(path)
                print(f"   ✅ Model loaded successfully")
                print(f"   📊 Model type: {type(model)}")
                
                # Try a simple prediction
                import numpy as np
                test_features = np.zeros((1, 37))  # 37 features as expected
                prediction = model.predict(test_features)
                print(f"   ✅ Test prediction successful: {prediction}")
                return True
                
            except Exception as e:
                print(f"   ❌ Model loading failed: {e}")
                return False
    
    print("   ❌ No model file found")
    return False

def check_port():
    """Check if port 8000 is available"""
    print("\n🔍 Checking port 8000...")
    
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', 8000))
    sock.close()
    
    if result == 0:
        print("   ⚠️  Port 8000 is in use")
        return False
    else:
        print("   ✅ Port 8000 is available")
        return True

def test_basic_fastapi():
    """Test if FastAPI can start with minimal config"""
    print("\n🔍 Testing basic FastAPI startup...")
    
    try:
        from fastapi import FastAPI
        from datetime import datetime
        
        app = FastAPI()
        
        @app.get("/")
        def root():
            return {"status": "ok", "timestamp": datetime.now().isoformat()}
        
        print("   ✅ FastAPI app created successfully")
        return True
        
    except Exception as e:
        print(f"   ❌ FastAPI startup failed: {e}")
        return False

def main():
    print("🏥 PulseNet Python Service Diagnostics")
    print("=" * 50)
    
    checks = [
        ("Dependencies", check_dependencies),
        ("Model File", check_model_file),
        ("Port Availability", check_port),
        ("FastAPI Basic", test_basic_fastapi)
    ]
    
    results = {}
    for name, check_func in checks:
        results[name] = check_func()
    
    print("\n" + "=" * 50)
    print("📊 Diagnostic Results:")
    
    all_passed = True
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All checks passed! The service should work.")
        print("💡 Try restarting the Python service:")
        print("   cd ml && python start_ai_service.py")
    else:
        print("\n❌ Some checks failed. Fix the issues above.")
        
    return all_passed

if __name__ == "__main__":
    main()