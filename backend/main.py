"""
ParkSight - Backend Module
Imports and exposes the FastAPI app and components from the root main.py entrypoint
for backward compatibility.
"""

from main import (
    app,
    initialize_system,
    health_check,
    health,
    get_dashboard_data,
    get_analytics_data,
    predict_occupancy,
    PredictionInput,
    PredictionResponse,
    MODEL_PATH,
    FEATURES_PATH,
    DATASET_PATH,
)

__all__ = [
    "app",
    "initialize_system",
    "health_check",
    "health",
    "get_dashboard_data",
    "get_analytics_data",
    "predict_occupancy",
    "PredictionInput",
    "PredictionResponse",
]
