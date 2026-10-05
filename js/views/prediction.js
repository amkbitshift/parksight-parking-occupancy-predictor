/**
 * ParkSight - Prediction View
 * User-friendly prediction interface for a college ML project.
 * Connects input features directly to the trained Gradient Boosting model.
 */

const PredictionView = {
  render(container) {
    const today = new Date().toISOString().split('T')[0];
    const defaultTime = "14:15";

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-header-title">Parking Occupancy Prediction</h1>
          <p class="view-header-subtitle">
            Enter a date, time, and recent occupancy counts to predict future parking occupancy with the trained Gradient Boosting model.
          </p>
        </div>
        <div class="view-header-actions">
          <span class="telemetry-pill">
            Trained on 7 Features
          </span>
        </div>
      </div>

      <!-- Quick Prediction Inputs (Presets) -->
      <div class="presets-container">
        <span class="presets-label">Quick Prediction Inputs:</span>
        <div class="preset-chips">
          <button class="preset-chip" data-preset="morning">Morning (08:30 Weekday)</button>
          <button class="preset-chip" data-preset="midday">Afternoon (12:45 Weekday)</button>
          <button class="preset-chip" data-preset="weekend">Weekend (16:30 Saturday)</button>
          <button class="preset-chip" data-preset="night">Night (23:15 Weekday)</button>
        </div>
      </div>

      <div class="prediction-layout">
        <!-- Input Form Card -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20v-6M6 20V10M18 20V4"/>
                </svg>
                Prediction Inputs
              </h2>
              <p class="card-subtitle">Values required by our trained scikit-learn model</p>
            </div>
          </div>
          <div class="card-body">
            <form id="predictionForm" autocomplete="off">
              <div class="form-section-title">1. Time & Date Selection</div>
              <div class="form-grid">
                <!-- Date Input -->
                <div class="form-group">
                  <label class="form-label" for="inputDate">
                    Target Date
                    <span class="form-label-hint">Day, Month, Day of Week</span>
                  </label>
                  <input type="date" id="inputDate" class="form-input" value="${today}" required>
                  <span class="input-help">Used to extract Day, Month, Day of Week, and Weekend</span>
                </div>

                <!-- Time Input -->
                <div class="form-group">
                  <label class="form-label" for="inputTime">
                    Target Time
                    <span class="form-label-hint">24-hour format</span>
                  </label>
                  <input type="time" id="inputTime" class="form-input" value="${defaultTime}" step="900" required>
                  <span class="input-help">Used to determine the Hour of the day</span>
                </div>
              </div>

              <div class="form-section-title">2. Recent Parking Data</div>
              <div class="form-grid">
                <!-- Previous Occupancy Input -->
                <div class="form-group">
                  <label class="form-label" for="inputPrevOcc">
                    Previous Occupancy (Lag-1)
                    <span class="form-label-hint">vehicles</span>
                  </label>
                  <input type="number" id="inputPrevOcc" class="form-input" min="0" max="6000" value="1680" required>
                  <span class="input-help">Number of vehicles parked in the previous 15-minute interval</span>
                </div>

                <!-- Recent Average Occupancy Input -->
                <div class="form-group">
                  <label class="form-label" for="inputRollAvg">
                    Recent Average (Rolling 3)
                    <span class="form-label-hint">vehicles</span>
                  </label>
                  <input type="number" id="inputRollAvg" class="form-input" min="0" max="6000" value="1620" required>
                  <span class="input-help">Average occupancy across the last 3 intervals (~45 minutes)</span>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
                <button type="submit" class="btn btn-primary" id="btnSubmitPredict" style="flex: 1; padding: 0.75rem;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Predict Occupancy
                </button>
                <button type="button" class="btn btn-secondary" id="btnResetPredict">
                  Reset
                </button>
              </div>
            </form>
          </div>
          <div class="card-footer">
            <span>FastAPI Endpoint: <code>POST /api/predict</code></span>
          </div>
        </div>

        <!-- Prediction Result Card Container -->
        <div class="prediction-result-panel" id="resultContainer">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    // Execute initial prediction
    this.executePrediction(container);

    // Event listeners
    const form = container.querySelector('#predictionForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.executePrediction(container);
    });

    const resetBtn = container.querySelector('#btnResetPredict');
    resetBtn.addEventListener('click', () => {
      container.querySelector('#inputDate').value = today;
      container.querySelector('#inputTime').value = defaultTime;
      container.querySelector('#inputPrevOcc').value = 1680;
      container.querySelector('#inputRollAvg').value = 1620;
      this.executePrediction(container);
    });

    // Preset handlers
    const presets = {
      morning: { time: "08:30", prev: 1350, roll: 1220, date: today },
      midday: { time: "12:45", prev: 2050, roll: 1980, date: today },
      weekend: { time: "16:30", prev: 2280, roll: 2210, date: today },
      night: { time: "23:15", prev: 420, roll: 490, date: today }
    };

    container.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.getAttribute('data-preset');
        const p = presets[type];
        if (p) {
          container.querySelector('#inputTime').value = p.time;
          container.querySelector('#inputPrevOcc').value = p.prev;
          container.querySelector('#inputRollAvg').value = p.roll;
          this.executePrediction(container);
        }
      });
    });
  },

  async executePrediction(container) {
    const submitBtn = container.querySelector('#btnSubmitPredict');
    const resultContainer = container.querySelector('#resultContainer');
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Running Model...`;
    }

    const payload = {
      dateStr: container.querySelector('#inputDate').value,
      timeStr: container.querySelector('#inputTime').value,
      previousOccupancy: container.querySelector('#inputPrevOcc').value,
      rollingAverage: container.querySelector('#inputRollAvg').value
    };

    try {
      const res = await ParkSightData.predictViaBackend(payload);
      this.renderResultCard(resultContainer, res);
    } catch (err) {
      console.error("Prediction error:", err);
      resultContainer.innerHTML = `
        <div class="result-card" style="border-color: var(--status-full-border); background-color: var(--status-full-bg); padding: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: var(--status-full); margin-bottom: 0.35rem;">
            Prediction Error
          </h3>
          <p style="font-size: 0.85rem; color: #7f1d1d; line-height: 1.4;">
            ${err.message || "Failed to communicate with FastAPI backend at /api/predict."}
          </p>
          <div style="margin-top: 0.75rem; font-size: 0.775rem; color: #991b1b;">
            Make sure the server is running (<code>python run.py</code>).
          </div>
        </div>
      `;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Predict Occupancy
        `;
      }
    }
  },

  renderResultCard(container, res) {
    const rawPrediction = res.predictedOccupancy;
    const roundedPrediction = Math.round(rawPrediction);
    const inputs = res.inputs;
    const isWeekendLabel = inputs.Is_Weekend === 1 ? "Weekend" : "Weekday";

    // Helpful demand indicator based on dataset statistics (Mean is ~3,378)
    let demandLevel = "Moderate";
    let badgeClass = "moderate";
    if (roundedPrediction < 2000) {
      demandLevel = "Low Demand";
      badgeClass = "low";
    } else if (roundedPrediction > 4000) {
      demandLevel = "High Demand";
      badgeClass = "high";
    }

    container.innerHTML = `
      <div class="result-card">
        <div class="result-hero">
          <div class="result-number-group">
            <span class="result-label">Predicted Occupancy</span>
            <div class="result-big-value">
              ${roundedPrediction.toLocaleString()} 
              <span style="font-size: 1.15rem; font-weight: 500; color: var(--text-muted);">vehicles</span>
            </div>
            <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 0.2rem;">
              Exact model output: <strong>${rawPrediction.toFixed(2)}</strong>
            </div>
          </div>
          <div>
            <span class="status-badge ${badgeClass}" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">
              ● ${demandLevel}
            </span>
          </div>
        </div>

        <!-- 4 Clear Summary Tiles -->
        <div class="result-metric-grid">
          <div class="result-metric-box">
            <div class="result-metric-title">Model Used</div>
            <div class="result-metric-val" style="font-size: 1.05rem;">Gradient Boosting</div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Trained with scikit-learn</span>
          </div>

          <div class="result-metric-box">
            <div class="result-metric-title">Target Time</div>
            <div class="result-metric-val" style="font-size: 1.05rem;">${res.meta.timeStr} (${isWeekendLabel})</div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">${res.meta.dayOfWeekName} (${res.meta.dateStr})</span>
          </div>

          <div class="result-metric-box">
            <div class="result-metric-title">Previous Occupancy Input</div>
            <div class="result-metric-val" style="font-size: 1.15rem;">${inputs.Previous_Occupancy.toLocaleString()}</div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Lag-1 observation</span>
          </div>

          <div class="result-metric-box">
            <div class="result-metric-title">Recent Rolling Average</div>
            <div class="result-metric-val" style="font-size: 1.15rem;">${inputs.Rolling_Average_3.toLocaleString()}</div>
            <span style="font-size: 0.7rem; color: var(--text-muted);">3-period moving average</span>
          </div>
        </div>

        <!-- Important Prediction Factors (Exact 7 Training Order) -->
        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em;">
              Important Prediction Factors (${res.featuresUsed.length} Features)
            </span>
            <span class="telemetry-pill" style="font-size: 0.675rem; padding: 0.2rem 0.5rem;">
              Exact Training Sequence
            </span>
          </div>

          <div class="table-container">
            <table class="data-table" style="font-size: 0.775rem;">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Value Passed</th>
                  <th>Explanation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Hour</code></td>
                  <td><strong>${inputs.Hour}</strong></td>
                  <td style="color: var(--text-muted);">Time of day in decimal hours (${res.meta.timeStr})</td>
                </tr>
                <tr>
                  <td><code>Day</code></td>
                  <td><strong>${inputs.Day}</strong></td>
                  <td style="color: var(--text-muted);">Calendar day of month</td>
                </tr>
                <tr>
                  <td><code>Month</code></td>
                  <td><strong>${inputs.Month}</strong></td>
                  <td style="color: var(--text-muted);">Calendar month index (1-12)</td>
                </tr>
                <tr>
                  <td><code>Day_of_Week</code></td>
                  <td><strong>${inputs.Day_of_Week}</strong></td>
                  <td style="color: var(--text-muted);">${res.meta.dayOfWeekName} (0=Monday, 6=Sunday)</td>
                </tr>
                <tr>
                  <td><code>Is_Weekend</code></td>
                  <td><strong>${inputs.Is_Weekend}</strong></td>
                  <td style="color: var(--text-muted);">${inputs.Is_Weekend === 1 ? '1 (Weekend)' : '0 (Weekday)'}</td>
                </tr>
                <tr>
                  <td><code>Previous_Occupancy</code></td>
                  <td><strong>${inputs.Previous_Occupancy.toLocaleString()}</strong></td>
                  <td style="color: var(--text-muted);">Most recent occupancy count (Lag-1)</td>
                </tr>
                <tr>
                  <td><code>Rolling_Average_3</code></td>
                  <td><strong>${inputs.Rolling_Average_3.toLocaleString()}</strong></td>
                  <td style="color: var(--text-muted);">Smoothed 45-minute average</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style="margin-top: 1.25rem; padding-top: 0.85rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
          <span>Algorithm: <strong>${res.modelType}</strong></span>
          <span style="color: var(--status-low); font-weight: 600;">● Real Model Output Active</span>
        </div>
      </div>
    `;
  }
};

window.PredictionView = PredictionView;
