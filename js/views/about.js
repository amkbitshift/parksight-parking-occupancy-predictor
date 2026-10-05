/**
 * ParkSight - About View
 * College Machine Learning Project overview, dataset specifications,
 * ML methodology, and model evaluation benchmarks.
 */

const AboutView = {
  render(container) {
    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-header-title">About ParkSight</h1>
          <p class="view-header-subtitle">
            Project background, dataset specifications, machine learning approach, and model evaluation results.
          </p>
        </div>
      </div>

      <div class="about-container">
        <!-- 1. Executive Summary & Problem Formulation -->
        <div class="about-hero-card">
          <span class="about-badge">College Machine Learning Project</span>
          <h2 class="about-title">Smart Parking Occupancy Predictor</h2>
          <p class="about-lead">
            ParkSight is a machine learning project that predicts future parking occupancy using historical time-series data from the KLCC parking facility. By extracting lag observations, rolling moving averages, and calendar features, the model learns diurnal and weekly demand cycles to forecast occupancy with high accuracy.
          </p>

          <div style="margin-top: 1.5rem;">
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.5rem;">
              End-to-End Machine Learning Workflow
            </div>
            <div class="flow-diagram-box">
              <div class="flow-step-card">
                <span class="flow-step-num">Step 01</span>
                <div class="flow-step-title">Dataset Collection</div>
                <p class="flow-step-desc">47,605 chronological parking records from the KLCC facility sampled at 15-minute intervals.</p>
              </div>

              <div class="flow-step-card">
                <span class="flow-step-num">Step 02</span>
                <div class="flow-step-title">Feature Engineering</div>
                <p class="flow-step-desc">Extracted Lag-1 previous occupancy, 3-period rolling average, and calendar variables (Hour, Day, Month, Day of Week, Is Weekend).</p>
              </div>

              <div class="flow-step-card">
                <span class="flow-step-num">Step 03</span>
                <div class="flow-step-title">Model Evaluation</div>
                <p class="flow-step-desc">Trained and compared Linear Regression, Random Forest, and Gradient Boosting in Google Colab.</p>
              </div>

              <div class="flow-step-card">
                <span class="flow-step-num">Step 04</span>
                <div class="flow-step-title">Web Application</div>
                <p class="flow-step-desc">FastAPI backend serving the serialized model (<code>.pkl</code>) with an interactive frontend interface.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Dataset Information & ML Approach (Two Columns) -->
        <div class="about-columns">
          <!-- Dataset Specifications -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                  Dataset Information
                </h3>
                <p class="card-subtitle">KLCC parking facility time-series records</p>
              </div>
            </div>
            <div class="card-body">
              <ul class="feature-list">
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Data File:</strong> <code>dataset/parking-klcc-2016-2017.txt</code> (semicolon-separated format).
                  </div>
                </li>
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Total Observations:</strong> 47,605 records collected chronologically between June 2016 and November 2017.
                  </div>
                </li>
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Data Cleaning:</strong> 33,386 numeric occupancy records used for regression. Non-numeric status values ("OPEN" and "FULL") were separated.
                  </div>
                </li>
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Target Variable:</strong> Total vehicle occupancy count at each 15-minute interval.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- ML Approach & Features -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Trained Feature Schema (7 Variables)
                </h3>
                <p class="card-subtitle">Features saved in <code>models/parking_features.pkl</code></p>
              </div>
            </div>
            <div class="card-body">
              <ul class="feature-list">
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Previous_Occupancy (Lag-1):</strong> Most recent occupancy count before the predicted window (accounting for 99.44% of model importance).
                  </div>
                </li>
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Rolling_Average_3:</strong> Moving average over the past 3 intervals (~45 minutes) to smooth out short-term fluctuations.
                  </div>
                </li>
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Time & Calendar Variables:</strong> <code>Hour</code> (diurnal pattern), <code>Day</code>, <code>Month</code>, <code>Day_of_Week</code>, and <code>Is_Weekend</code>.
                  </div>
                </li>
                <li class="feature-list-item">
                  <svg class="feature-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <strong>Validation Approach:</strong> Chronological train/test split (80/20) to prevent lookahead data leakage in time-series evaluation.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 3. Models Compared & Best Model: Gradient Boosting -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Model Comparison (Google Colab Results)
              </h3>
              <p class="card-subtitle">Comparison of regression algorithms evaluated on the test set</p>
            </div>
            <span class="status-badge low">Best Model: Gradient Boosting</span>
          </div>
          <div class="card-body">
            <div class="table-container" style="margin-bottom: 1.5rem;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Candidate Algorithm</th>
                    <th>MAE (Average Error)</th>
                    <th>RMSE</th>
                    <th>R² Score (Accuracy)</th>
                    <th>Evaluation Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background-color: var(--brand-primary-light);">
                    <td><strong>Gradient Boosting Regressor</strong></td>
                    <td><strong>24.3</strong></td>
                    <td><strong>36.8</strong></td>
                    <td><strong>0.942</strong></td>
                    <td><span class="status-badge info">Selected for Deployment</span></td>
                  </tr>
                  <tr>
                    <td>Random Forest Regressor</td>
                    <td>28.1</td>
                    <td>42.5</td>
                    <td>0.926</td>
                    <td><span class="status-badge">Colab Benchmark</span></td>
                  </tr>
                  <tr>
                    <td>Linear Regression</td>
                    <td>58.4</td>
                    <td>79.3</td>
                    <td>0.785</td>
                    <td><span class="status-badge">Baseline Model</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Deep Dive Rationale for Best Model -->
            <div style="background-color: var(--bg-app); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
              <h4 style="font-size: 0.925rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
                Why Gradient Boosting Performed Best
              </h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.75rem;">
                Gradient Boosting builds an ensemble of shallow decision trees where each new tree corrects the errors made by previous ones. For this dataset:
              </p>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div style="font-size: 0.825rem; color: var(--text-secondary);">
                  <strong style="color: var(--text-primary); display: block; margin-bottom: 0.2rem;">Lowest Prediction Error:</strong>
                  Achieved a Mean Absolute Error of only 24.3 vehicles, outperforming Linear Regression (58.4) and Random Forest (28.1).
                </div>
                <div style="font-size: 0.825rem; color: var(--text-secondary);">
                  <strong style="color: var(--text-primary); display: block; margin-bottom: 0.2rem;">High Variance Explained:</strong>
                  The R² score of 0.942 means that 94.2% of the variance in parking occupancy is successfully explained by the 7 input features.
                </div>
                <div style="font-size: 0.825rem; color: var(--text-secondary);">
                  <strong style="color: var(--text-primary); display: block; margin-bottom: 0.2rem;">Non-Linear Patterns:</strong>
                  Effectively captured non-linear relationships between time of day, day of week, and recent occupancy momentum.
                </div>
                <div style="font-size: 0.825rem; color: var(--text-secondary);">
                  <strong style="color: var(--text-primary); display: block; margin-bottom: 0.2rem;">Fast Inference:</strong>
                  The saved model executes quickly in Python, making it ideal for interactive web predictions via our FastAPI endpoint.
                </div>
              </div>
            </div>

            <!-- Code Preview Box -->
            <div style="margin-top: 1.25rem;">
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.5rem;">
                Backend Integration (FastAPI Endpoint)
              </div>
              <div class="code-preview-box">
<span class="code-comment"># backend/main.py</span>
<span class="code-keyword">import</span> joblib
<span class="code-keyword">import</span> pandas <span class="code-keyword">as</span> pd
<span class="code-keyword">from</span> fastapi <span class="code-keyword">import</span> FastAPI

app = FastAPI(title=<span class="code-str">"ParkSight Occupancy Prediction API"</span>)
features = joblib.load(<span class="code-str">'models/parking_features.pkl'</span>)
model = joblib.load(<span class="code-str">'models/parking_occupancy_model.pkl'</span>)

@app.post(<span class="code-str">"/api/predict"</span>)
<span class="code-keyword">def</span> <span class="code-func">predict_occupancy</span>(data: dict):
    input_df = pd.DataFrame([data])[features]
    prediction = model.predict(input_df)[0]
    <span class="code-keyword">return</span> {<span class="code-str">"predicted_occupancy"</span>: float(prediction)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.AboutView = AboutView;
