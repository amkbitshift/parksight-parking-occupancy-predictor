"""
ParkSight Application Launcher
Launches the FastAPI backend serving both the ML prediction API (/api/predict)
and the frontend web application interface.
"""

import sys
import os
import webbrowser
import uvicorn

def main():
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    url = f"http://{host}:{port}"

    print("=" * 64)
    print("  PARKSIGHT - INTELLIGENT PARKING OCCUPANCY FORECASTING")
    print("=" * 64)
    print(f"  FastAPI Backend & Web UI:  {url}")
    print(f"  Interactive API Docs:      {url}/docs")
    print(f"  Health Check:              {url}/health")
    print(f"  Real Model Endpoint:       POST {url}/api/predict")
    print("=" * 64)

    try:
        if os.environ.get("AUTO_OPEN_BROWSER", "1") == "1":
            webbrowser.open(url)
    except Exception:
        pass

    # Launch Uvicorn server for main:app
    uvicorn.run("main:app", host=host, port=port, log_level="info")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[ParkSight] Server shut down gracefully.")
