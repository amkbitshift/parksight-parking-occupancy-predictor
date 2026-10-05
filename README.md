# ParkSight - Smart Parking Occupancy Predictor

A professional machine learning web application that forecasts urban parking occupancy using historical time-series data from the KLCC parking complex. Built with a FastAPI backend and a clean, responsive frontend.

---

## Overview

ParkSight formulates parking availability as a multivariate time-series regression task. By analyzing temporal patterns (hour, day, month, weekend) alongside autoregressive lag features (previous occupancy and 3-period rolling average), the trained model generates accurate occupancy projections.

---

## Machine Learning Architecture

- **Dataset**: KLCC Parking Facility (`dataset/parking-klcc-2016-2017.txt`)
  - **47,605** total chronological records (June 2016 – November 2017)
  - **33,386** numeric occupancy observations sampled at 15-minute intervals
- **Champion Model**: `GradientBoostingRegressor`
- **Trained Feature Schema (7 Variables)**:
  1. `Hour` — Time of day (decimal hours)
  2. `Day` — Calendar day of month
  3. `Month` — Calendar month index (1–12)
  4. `Day_of_Week` — Day index (0 = Monday, 6 = Sunday)
  5. `Is_Weekend` — Binary weekend indicator (1 if Saturday or Sunday, else 0)
  6. `Previous_Occupancy` — Lag-1 occupancy count from the previous 15-minute window
  7. `Rolling_Average_3` — 3-period moving average (~45 minutes)

### Model Comparison & Evaluation (Test Set)

| Algorithm | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | R² Score | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Gradient Boosting Regressor** | **24.3** | **36.8** | **0.942** | **Best Performing Model (Deployed)** |
| Random Forest Regressor | 28.1 | 42.5 | 0.926 | Benchmark |
| Linear Regression | 58.4 | 79.3 | 0.785 | Baseline |

---

## Project Structure

```
Smart Parking Occupancy Predictor/
├── backend/
│   └── main.py             # FastAPI service (endpoints: /api/predict, /api/dashboard, /api/analytics)
├── css/
│   └── styles.css          # Clean SaaS design system & responsive styling
├── dataset/
│   └── parking-klcc-2016-2017.txt  # KLCC sequential telemetry records
├── js/
│   ├── app.js              # Client-side router & page lifecycle
│   ├── charts.js           # Chart.js visualization configurations
│   ├── data.js             # Data service layer
│   ├── vendor/
│   │   └── chart.umd.min.js# Offline Chart.js library
│   └── views/
│       ├── dashboard.js    # Overview dashboard (#dashboard)
│       ├── prediction.js   # Interactive prediction simulator (#prediction)
│       ├── analytics.js    # Analytical charts & model benchmarks (#analytics)
│       └── about.js        # Project architecture & documentation (#about)
├── models/
│   ├── parking_occupancy_model.pkl # Trained GradientBoostingRegressor
│   └── parking_features.pkl        # Serialized feature list
├── index.html              # Frontend application entry point
├── run.py                  # Single-command launcher (FastAPI + Web UI)
├── requirements.txt        # Python package dependencies
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.9+ installed

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd "Smart Parking Occupancy Predictor"
pip install -r requirements.txt
```

### 2. Run the Application

```bash
python run.py
```

The application will launch and open automatically in your browser at:
- **Web Interface:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## API Endpoints

- `GET /api/health`: Health status and loaded model confirmation.
- `GET /api/dashboard`: Latest recorded dataset occupancy, 15-minute model forecast, and historical trend series.
- `GET /api/analytics`: 24-hour occupancy averages, weekday vs. weekend distribution, and feature importance rankings.
- `POST /api/predict`: Generates predicted occupancy for given 7 features.
  ```json
  {
    "Hour": 14.25,
    "Day": 5,
    "Month": 10,
    "Day_of_Week": 0,
    "Is_Weekend": 0,
    "Previous_Occupancy": 1680.0,
    "Rolling_Average_3": 1620.0
  }
  ```

---

## License

This project is created for educational and research purposes.
