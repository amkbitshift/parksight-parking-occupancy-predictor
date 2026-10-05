/**
 * ParkSight - Analytics View
 * Diagnostic analytics populated from real KLCC dataset calculations,
 * validated Colab benchmark models, and real Gradient Boosting feature importances.
 * Tailored for clarity in a student machine learning project presentation.
 */

const AnalyticsView = {
  dataCache: null,

  async render(container) {
    container.innerHTML = `
      <div style="padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
        <div style="display: inline-block; width: 28px; height: 28px; border: 3px solid var(--border-color); border-top-color: var(--brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 0.75rem;"></div>
        <div style="font-size: 0.9rem; font-weight: 500;">Calculating dataset analytics & model evaluations...</div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    try {
      this.dataCache = await ParkSightData.fetchAnalyticsData();
      this.renderContent(container, this.dataCache);
    } catch (err) {
      console.error("Analytics data load error:", err);
      container.innerHTML = `
        <div class="result-card" style="border-color: var(--status-full-border); background-color: var(--status-full-bg); padding: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: var(--status-full); margin-bottom: 0.5rem;">
            Failed to Load Analytics Data
          </h3>
          <p style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 0.75rem;">
            ${err.message || "Error communicating with backend endpoint GET /api/analytics."}
          </p>
          <button class="btn btn-secondary btn-sm" onclick="AnalyticsView.render(document.getElementById('viewContent'))">
            Retry Loading
          </button>
        </div>
      `;
    }
  },

  renderContent(container, data) {
    const obs = data.observation_count;
    const models = data.model_performance;
    const featList = data.feature_importance;

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-header-title">Parking Data Analytics & Model Performance</h1>
          <p class="view-header-subtitle">
            Visualizations of occupancy patterns from the KLCC dataset and evaluation metrics of our trained models.
          </p>
        </div>
        <div class="view-header-actions">
          <span class="telemetry-pill">
            Dataset: ${obs.total_records.toLocaleString()} Observations (${obs.numeric_records.toLocaleString()} numeric)
          </span>
        </div>
      </div>

      <!-- Section 1: Hourly and Weekday/Weekend Charts -->
      <div class="analytics-grid-top">
        <!-- Chart 1: Average Occupancy by Hour of Day -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Average Occupancy by Hour of Day
              </h2>
              <p class="card-subtitle">24-hour mean occupancy computed across all 33,386 numeric dataset records</p>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="chartHourlyOccupancy"></canvas>
            </div>
          </div>
          <div class="card-footer" style="display: flex; justify-content: space-between;">
            <span>Highest average occupancy occurs at night (~4,600 vehicles)</span>
            <span>Lowest average occupancy occurs around 15:00 (~1,666 vehicles)</span>
          </div>
        </div>

        <!-- Chart 2: Weekday vs Weekend Comparison -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Weekday vs. Weekend Occupancy
              </h2>
              <p class="card-subtitle">Average occupancy across 2-hour intervals</p>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="chartWeekdayWeekend"></canvas>
            </div>
          </div>
          <div class="card-footer" style="display: flex; justify-content: space-between;">
            <span>Weekday Midday: ~1,349 vehicles</span>
            <span>Weekend Midday: ~2,404 vehicles</span>
          </div>
        </div>
      </div>

      <!-- Section 2: Historical Occupancy Trend -->
      <div class="analytics-grid-full">
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Historical Daily Occupancy Trend
              </h2>
              <p class="card-subtitle">Daily average occupancy calculated across the last 30 recorded days</p>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="chartHistoricalTrend"></canvas>
            </div>
          </div>
          <div class="card-footer">
            <span>Derived strictly from chronological numerical rows in parking-klcc-2016-2017.txt</span>
          </div>
        </div>
      </div>

      <!-- Section 3: Model Performance Section -->
      <div class="analytics-grid-bottom">
        <!-- Model Validation Metrics -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Model Performance Comparison
              </h2>
              <p class="card-subtitle">Evaluation results on unseen test data from our Google Colab experiment</p>
            </div>
            <span class="status-badge low">Best Model: Gradient Boosting</span>
          </div>
          <div class="card-body">
            <!-- Summary Metrics Cards for Champion Model -->
            <div class="metrics-row">
              <div class="metric-pill-card">
                <div class="title">MAE</div>
                <div class="value">24.3</div>
                <div class="sub">Average error in vehicles</div>
              </div>
              <div class="metric-pill-card">
                <div class="title">RMSE</div>
                <div class="value">36.8</div>
                <div class="sub">Root Mean Squared Error</div>
              </div>
              <div class="metric-pill-card">
                <div class="title">R² Score</div>
                <div class="value">0.942</div>
                <div class="sub">94.2% variance explained</div>
              </div>
              <div class="metric-pill-card">
                <div class="title">Observations</div>
                <div class="value">47,605</div>
                <div class="sub">Total dataset rows</div>
              </div>
            </div>

            <!-- Comparison Table (Exact 3 Colab Models) -->
            <div style="margin-top: 1rem;">
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.5rem;">
                Evaluated Algorithms Comparison
              </div>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>MAE (Error)</th>
                      <th>RMSE</th>
                      <th>R² Score (Accuracy)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${models.map(row => `
                      <tr style="${row.is_best ? 'background-color: var(--brand-primary-light); font-weight: 600;' : ''}">
                        <td>
                          ${row.model}
                          ${row.is_best ? '<span class="status-badge info" style="margin-left: 0.35rem; font-size: 0.65rem;">Best Model</span>' : ''}
                        </td>
                        <td>${row.mae}</td>
                        <td>${row.rmse}</td>
                        <td>${row.r2}</td>
                        <td>
                          <span class="status-badge ${row.is_best ? 'low' : ''}">
                            ${row.is_best ? 'Selected for API' : 'Benchmark'}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Feature Importance (From Model) -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Feature Importance
              </h2>
              <p class="card-subtitle">Contribution of each input feature in the trained Gradient Boosting model</p>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrapper" style="height: 240px;">
              <canvas id="chartFeatureImportance"></canvas>
            </div>

            <div style="margin-top: 1rem;">
              <table class="data-table" style="font-size: 0.775rem;">
                <thead>
                  <tr>
                    <th>Feature Name</th>
                    <th>Importance %</th>
                    <th>Raw Score</th>
                    <th>Feature Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${featList.map(f => `
                    <tr>
                      <td><code>${f.feature}</code></td>
                      <td><strong>${f.importance_pct}%</strong></td>
                      <td style="font-family: var(--font-mono); color: var(--text-muted);">${f.importance_raw.toFixed(6)}</td>
                      <td style="color: var(--text-muted);">
                        ${f.feature === 'Previous_Occupancy' ? 'Previous 15-min count (strongest predictor)' : 
                          f.feature === 'Rolling_Average_3' ? 'Smoothed 45-minute moving average' :
                          f.feature === 'Hour' ? 'Time of day pattern' :
                          f.feature === 'Is_Weekend' ? 'Weekday vs Weekend indicator' :
                          'Calendar date indicator'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render charts with real backend data
    setTimeout(() => {
      ParkSightCharts.renderHourlyOccupancy('chartHourlyOccupancy', data.hourly_occupancy);
      ParkSightCharts.renderWeekdayVsWeekend('chartWeekdayWeekend', data.weekday_vs_weekend);
      ParkSightCharts.renderHistoricalTrend('chartHistoricalTrend', data.historical_trend);
      ParkSightCharts.renderFeatureImportance('chartFeatureImportance', data.feature_importance);
    }, 50);
  }
};

window.AnalyticsView = AnalyticsView;
