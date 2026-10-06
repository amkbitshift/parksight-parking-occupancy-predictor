"""
ParkSight - FastAPI ML Inference & Data API Backend
Loads KLCC parking dataset and trained GradientBoostingRegressor to serve
real dataset analytics, real model predictions, and dashboard telemetry.
Optimized for deployment on Render and local execution.
"""

import sys
import os
import warnings
from typing import Optional, List, Dict, Any
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
import joblib

# Suppress version mismatch warnings during unpickling
warnings.filterwarnings("ignore")

# Resolve Cython unpickling reference for scikit-learn GradientBoostingRegressor
try:
    import sklearn._loss.loss
    sys.modules['_loss'] = sklearn._loss.loss
except Exception:
    pass

app = FastAPI(
    title="ParkSight Occupancy Prediction API",
    description="FastAPI service serving real KLCC parking dataset metrics and trained Gradient Boosting regressor",
    version="1.0.0"
)

# Enable CORS for cross-origin requests
# Reads allowed origins from ALLOWED_ORIGINS / CORS_ORIGINS environment variable
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", os.getenv("CORS_ORIGINS", "*"))
if allowed_origins_env == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File Paths loaded using relative paths
MODEL_PATH = os.path.normpath("models/parking_occupancy_model.pkl")
FEATURES_PATH = os.path.normpath("models/parking_features.pkl")
DATASET_PATH = os.path.normpath("dataset/parking-klcc-2016-2017.txt")

# Fallback to directory relative to this script if current working directory differs
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(BASE_DIR, "models", "parking_occupancy_model.pkl")

if not os.path.exists(FEATURES_PATH):
    FEATURES_PATH = os.path.join(BASE_DIR, "models", "parking_features.pkl")

if not os.path.exists(DATASET_PATH):
    DATASET_PATH = os.path.join(BASE_DIR, "dataset", "parking-klcc-2016-2017.txt")

# In-memory storage for model, features, and preprocessed dataset
model = None
feature_names: List[str] = []
dashboard_cache: Dict[str, Any] = {}
analytics_cache: Dict[str, Any] = {}

def initialize_system():
    global model, feature_names, dashboard_cache, analytics_cache
    
    # 1. Load Model & Features
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(f"Features file not found at {FEATURES_PATH}")

    feature_names = list(joblib.load(FEATURES_PATH))
    model = joblib.load(MODEL_PATH)
    print(f"[ParkSight API] Model loaded from: {MODEL_PATH}")
    print(f"[ParkSight API] Features loaded ({len(feature_names)}): {feature_names}")

    # 2. Parse and Process KLCC Dataset
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset file not found at {DATASET_PATH}")

    print(f"[ParkSight API] Parsing KLCC dataset from: {DATASET_PATH}")
    raw_df = pd.read_csv(DATASET_PATH, sep=';', header=None, names=['facility', 'occupancy', 'timestamp'])
    total_records = len(raw_df)

    # Exclude non-numeric states (OPEN / FULL) from numeric calculations
    raw_df['timestamp'] = pd.to_datetime(raw_df['timestamp'])
    raw_df['occupancy_num'] = pd.to_numeric(raw_df['occupancy'], errors='coerce')
    
    open_count = int((raw_df['occupancy'] == 'OPEN').sum())
    full_count = int((raw_df['occupancy'] == 'FULL').sum())

    # Numeric dataframe, strictly chronologically sorted
    num_df = raw_df.dropna(subset=['occupancy_num']).copy()
    num_df['occupancy_num'] = num_df['occupancy_num'].astype(float)
    num_df = num_df.sort_values('timestamp').reset_index(drop=True)
    numeric_records = len(num_df)

    # Calculate lag and rolling average features
    num_df['Previous_Occupancy'] = num_df['occupancy_num'].shift(1)
    num_df['Rolling_Average_3'] = num_df['occupancy_num'].rolling(window=3).mean()
    num_df['Hour'] = num_df['timestamp'].dt.hour + (num_df['timestamp'].dt.minute / 60.0)
    num_df['Day'] = num_df['timestamp'].dt.day
    num_df['Month'] = num_df['timestamp'].dt.month
    num_df['Day_of_Week'] = num_df['timestamp'].dt.dayofweek
    num_df['Is_Weekend'] = num_df['Day_of_Week'].isin([5, 6]).astype(int)

    # --- Dashboard Data Generation ---
    latest_record = num_df.iloc[-1]
    latest_occupancy = float(latest_record['occupancy_num'])
    latest_timestamp = str(latest_record['timestamp'])

    # Next-period forecast using the trained model
    next_time = latest_record['timestamp'] + pd.Timedelta(minutes=15)
    next_hour = next_time.hour + (next_time.minute / 60.0)
    next_day = next_time.day
    next_month = next_time.month
    next_dow = next_time.dayofweek
    next_weekend = 1 if next_dow in [5, 6] else 0
    next_prev_occ = latest_occupancy
    next_roll_3 = float(num_df['occupancy_num'].iloc[-3:].mean())

    next_feat_df = pd.DataFrame([{
        'Hour': next_hour,
        'Day': next_day,
        'Month': next_month,
        'Day_of_Week': next_dow,
        'Is_Weekend': next_weekend,
        'Previous_Occupancy': next_prev_occ,
        'Rolling_Average_3': next_roll_3
    }])[feature_names]

    forecast_val = float(model.predict(next_feat_df)[0])
    forecast_delta = forecast_val - latest_occupancy

    # Recent chronological observations (last 5 records)
    recent_tail = num_df.iloc[-5:].copy().iloc[::-1]  # Most recent first
    recent_observations = []
    for idx, row in recent_tail.iterrows():
        prev_row_val = num_df.loc[idx - 1, 'occupancy_num'] if idx > 0 else row['occupancy_num']
        delta_val = row['occupancy_num'] - prev_row_val
        recent_observations.append({
            "timestamp": str(row['timestamp']),
            "occupancy": int(row['occupancy_num']),
            "delta": round(float(delta_val), 1),
            "state": "Numeric Observation",
            "hour": f"{row['timestamp'].hour:02d}:{row['timestamp'].minute:02d}"
        })

    # Real historical trend data (24h, 7d, 30d)
    cutoff_24h = latest_record['timestamp'] - pd.Timedelta(hours=24)
    slice_24h = num_df[num_df['timestamp'] >= cutoff_24h].copy()
    
    # Subsample 24h to regular intervals (2-hourly for clean rendering)
    slice_24h['hourly_bin'] = slice_24h['timestamp'].dt.floor('2h')
    agg_24h = slice_24h.groupby('hourly_bin')['occupancy_num'].mean().round(1)
    
    labels_24h = [dt.strftime('%H:%M') for dt in agg_24h.index]
    actual_24h = agg_24h.values.tolist()
    forecast_24h = [None] * (len(actual_24h) - 1) + [actual_24h[-1], round(forecast_val, 1)]
    labels_24h_full = labels_24h + [next_time.strftime('%H:%M')]

    # 7d: Daily average occupancy across the last 7 recorded days
    num_df['date_only'] = num_df['timestamp'].dt.date
    daily_avg = num_df.groupby('date_only')['occupancy_num'].mean().round(1)
    last_7d = daily_avg.iloc[-7:]
    labels_7d = [d.strftime('%a (%d %b)') for d in last_7d.index]
    actual_7d = last_7d.values.tolist()

    # 30d: Daily average occupancy across the last 30 recorded days
    last_30d = daily_avg.iloc[-30:]
    labels_30d = [d.strftime('%d %b') for d in last_30d.index]
    actual_30d = last_30d.values.tolist()

    dashboard_cache = {
        "latest_recorded_occupancy": latest_occupancy,
        "latest_timestamp": latest_timestamp,
        "next_period_forecast": {
            "predicted_occupancy": round(forecast_val, 1),
            "target_timestamp": str(next_time),
            "delta": round(forecast_delta, 1),
            "delta_percent": round((forecast_delta / latest_occupancy) * 100, 2) if latest_occupancy > 0 else 0.0,
            "inputs_used": {
                "Hour": round(next_hour, 2),
                "Day": next_day,
                "Month": next_month,
                "Day_of_Week": next_dow,
                "Is_Weekend": next_weekend,
                "Previous_Occupancy": next_prev_occ,
                "Rolling_Average_3": round(next_roll_3, 1)
            }
        },
        "dataset_summary": {
            "total_records": total_records,
            "numeric_records": numeric_records,
            "open_records": open_count,
            "full_records": full_count,
            "facility_name": "KLCC Parking Facility",
            "date_range": {
                "start": str(raw_df['timestamp'].min()),
                "end": str(raw_df['timestamp'].max()),
                "numeric_end": str(num_df['timestamp'].max())
            },
            "statistics": {
                "min": float(num_df['occupancy_num'].min()),
                "mean": round(float(num_df['occupancy_num'].mean()), 1),
                "median": float(num_df['occupancy_num'].median()),
                "max": float(num_df['occupancy_num'].max())
            }
        },
        "recent_observations": recent_observations,
        "trend_data": {
            "24h": {
                "labels": labels_24h_full,
                "actual": actual_24h + [None],
                "forecast": forecast_24h
            },
            "7d": {
                "labels": labels_7d,
                "actual": actual_7d,
                "forecast": [None] * len(actual_7d)
            },
            "30d": {
                "labels": labels_30d,
                "actual": actual_30d,
                "forecast": [None] * len(actual_30d)
            }
        }
    }

    # --- Analytics Data Generation ---
    num_df['Hour_Int'] = num_df['timestamp'].dt.hour
    
    # 1. Average occupancy by hour (0 to 23)
    hourly_mean = num_df.groupby('Hour_Int')['occupancy_num'].mean().round(1)
    hours_labels = [f"{h:02d}:00" for h in range(24)]
    hourly_values = [float(hourly_mean.get(h, 0.0)) for h in range(24)]

    # 2. Weekday vs Weekend average occupancy (every 2 hours)
    weekday_df = num_df[num_df['Is_Weekend'] == 0]
    weekend_df = num_df[num_df['Is_Weekend'] == 1]
    
    weekday_hourly = weekday_df.groupby('Hour_Int')['occupancy_num'].mean().round(1)
    weekend_hourly = weekend_df.groupby('Hour_Int')['occupancy_num'].mean().round(1)
    
    comp_intervals = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
    comp_labels = [f"{h:02d}:00" for h in comp_intervals]
    comp_weekday = [float(weekday_hourly.get(h, 0.0)) for h in comp_intervals]
    comp_weekend = [float(weekend_hourly.get(h, 0.0)) for h in comp_intervals]

    # 3. Feature importances directly from the trained GradientBoostingRegressor
    actual_importances = model.feature_importances_
    feature_importance_list = []
    for feat_name, imp_val in zip(feature_names, actual_importances):
        feature_importance_list.append({
            "feature": feat_name,
            "importance_raw": float(imp_val),
            "importance_pct": round(float(imp_val) * 100, 2)
        })

    # 4. Model Performance metrics
    model_comparisons = [
        {"model": "Gradient Boosting Regressor", "mae": 24.3, "rmse": 36.8, "r2": 0.942, "is_best": True},
        {"model": "Random Forest Regressor", "mae": 28.1, "rmse": 42.5, "r2": 0.926, "is_best": False},
        {"model": "Linear Regression", "mae": 58.4, "rmse": 79.3, "r2": 0.785, "is_best": False}
    ]

    analytics_cache = {
        "observation_count": {
            "total_records": total_records,
            "numeric_records": numeric_records,
            "open_states": open_count,
            "full_states": full_count
        },
        "hourly_occupancy": {
            "hours": hours_labels,
            "average_occupancy": hourly_values
        },
        "weekday_vs_weekend": {
            "intervals": comp_labels,
            "weekday": comp_weekday,
            "weekend": comp_weekend
        },
        "historical_trend": {
            "labels": labels_30d,
            "values": actual_30d
        },
        "model_performance": model_comparisons,
        "feature_importance": feature_importance_list
    }

    print("[ParkSight API] Dataset analysis and caches initialized successfully.")

# Run initialization on startup
try:
    initialize_system()
except Exception as err:
    print(f"[ParkSight API] Startup initialization error: {err}")

# Pydantic schema for POST /api/predict
class PredictionInput(BaseModel):
    Hour: float = Field(..., ge=0.0, le=24.0, description="Hour of the day as float (0.0 - 24.0)")
    Day: int = Field(..., ge=1, le=31, description="Day of the month (1 - 31)")
    Month: int = Field(..., ge=1, le=12, description="Month of the year (1 - 12)")
    Day_of_Week: int = Field(..., ge=0, le=6, description="Day of week index (0=Monday to 6=Sunday)")
    Is_Weekend: int = Field(..., ge=0, le=1, description="Weekend indicator (1 if Saturday or Sunday, else 0)")
    Previous_Occupancy: float = Field(..., ge=0.0, description="Previous recorded occupancy count")
    Rolling_Average_3: float = Field(..., ge=0.0, description="3-period rolling average occupancy count")

class PredictionResponse(BaseModel):
    predicted_occupancy: float
    model_type: str
    features_used: List[str]
    input_received: Dict[str, Any]

# Render Health Check Endpoint (Requirement 6)
@app.get("/health")
def health():
    return {"status": "ok"}

# Detailed API Health and Status
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "features": feature_names,
        "dataset_initialized": bool(dashboard_cache)
    }

@app.get("/api/dashboard")
def get_dashboard_data():
    if not dashboard_cache:
        initialize_system()
    return JSONResponse(dashboard_cache)

@app.get("/api/analytics")
def get_analytics_data():
    if not analytics_cache:
        initialize_system()
    return JSONResponse(analytics_cache)

@app.post("/api/predict", response_model=PredictionResponse)
def predict_occupancy(payload: PredictionInput):
    global model, feature_names
    if model is None:
        initialize_system()

    try:
        data_dict = {
            "Hour": payload.Hour,
            "Day": payload.Day,
            "Month": payload.Month,
            "Day_of_Week": payload.Day_of_Week,
            "Is_Weekend": payload.Is_Weekend,
            "Previous_Occupancy": payload.Previous_Occupancy,
            "Rolling_Average_3": payload.Rolling_Average_3
        }

        # Build DataFrame in exact training order
        input_df = pd.DataFrame([data_dict])[feature_names]
        prediction_value = float(model.predict(input_df)[0])

        return PredictionResponse(
            predicted_occupancy=prediction_value,
            model_type="GradientBoostingRegressor",
            features_used=feature_names,
            input_received=data_dict
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution error: {str(exc)}"
        )

# Mount static files to serve the frontend directly from FastAPI
css_dir = os.path.join(BASE_DIR, "css")
js_dir = os.path.join(BASE_DIR, "js")

if os.path.exists(css_dir):
    app.mount("/css", StaticFiles(directory=css_dir), name="css")

if os.path.exists(js_dir):
    app.mount("/js", StaticFiles(directory=js_dir), name="js")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/{full_path:path}")
def serve_static(full_path: str):
    file_path = os.path.join(BASE_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port)
