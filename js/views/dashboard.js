/**
 * ParkSight - Dashboard View
 * Simplified and student-friendly overview of real KLCC parking observations,
 * latest recorded occupancy, and next-period Gradient Boosting predictions.
 */

const DashboardView = {
  dataCache: null,
  activeFilter: '24h',

  async render(container) {
    container.innerHTML = `
      <div style="padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
        <div style="display: inline-block; width: 28px; height: 28px; border: 3px solid var(--border-color); border-top-color: var(--brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 0.75rem;"></div>
        <div style="font-size: 0.9rem; font-weight: 500;">Loading dataset observations & model prediction...</div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    try {
      this.dataCache = await ParkSightData.fetchDashboardData();
      this.renderContent(container, this.dataCache);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      container.innerHTML = `
        <div class="result-card" style="border-color: var(--status-full-border); background-color: var(--status-full-bg); padding: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 700; color: var(--status-full); margin-bottom: 0.5rem;">
            Failed to Load Dashboard Data
          </h3>
          <p style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 0.75rem;">
            ${err.message || "Error communicating with backend endpoint GET /api/dashboard."}
          </p>
          <button class="btn btn-secondary btn-sm" onclick="DashboardView.render(document.getElementById('viewContent'))">
            Retry Loading
          </button>
        </div>
      `;
    }
  },

  renderContent(container, d) {
    const latestOcc = d.latest_recorded_occupancy;
    const forecast = d.next_period_forecast;
    const summary = d.dataset_summary;
    const stats = summary.statistics;

    // Percentages for state breakdown
    const numPct = ((summary.numeric_records / summary.total_records) * 100).toFixed(1);
    const openPct = ((summary.open_records / summary.total_records) * 100).toFixed(1);
    const fullPct = ((summary.full_records / summary.total_records) * 100).toFixed(1);

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-header-title">Parking Occupancy Dashboard</h1>
          <p class="view-header-subtitle">
            Historical observations from the KLCC parking dataset and next-period machine learning predictions.
          </p>
        </div>
        <div class="view-header-actions">
          <button class="btn btn-secondary" id="btnRefreshDashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Refresh Data
          </button>
          <a href="#prediction" class="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Make a Prediction
          </a>
        </div>
      </div>

      <!-- 4 Real Dataset & Model KPI Cards -->
      <div class="kpi-grid">
        <!-- 1. Latest Recorded Occupancy -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Latest Recorded Occupancy</span>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" id="kpiCurrentOccupancy">${Math.round(latestOcc).toLocaleString()}</span>
            <span class="kpi-subtext">parked vehicles</span>
          </div>
          <div style="font-size: 0.775rem; color: var(--text-muted); margin: 0.4rem 0;">
            Recorded on: <strong>${d.latest_timestamp}</strong>
          </div>
          <div class="kpi-bottom">
            <span>Source</span>
            <span class="status-badge low">Actual Dataset Record</span>
          </div>
        </div>

        <!-- 2. Dataset Observation Count -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Dataset Size</span>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" style="color: var(--brand-primary);">${summary.total_records.toLocaleString()}</span>
            <span class="kpi-subtext">total observations</span>
          </div>
          <div style="font-size: 0.775rem; color: var(--text-muted); margin: 0.4rem 0;">
            Numeric records: <strong>${summary.numeric_records.toLocaleString()}</strong> (${numPct}%)
          </div>
          <div class="kpi-bottom">
            <span>Interval</span>
            <strong>Every 15 minutes</strong>
          </div>
        </div>

        <!-- 3. Next-Period Forecast (+15m) -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Next-Period Prediction (+15m)</span>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value">${Math.round(forecast.predicted_occupancy).toLocaleString()}</span>
            <span class="kpi-subtext">vehicles forecast</span>
          </div>
          <div style="font-size: 0.775rem; color: var(--text-muted); margin: 0.4rem 0;">
            Target time: <strong>${forecast.target_timestamp}</strong>
          </div>
          <div class="kpi-bottom">
            <span>Change in Occupancy</span>
            <strong style="color: ${forecast.delta >= 0 ? '#ea580c' : '#059669'};">
              ${forecast.delta >= 0 ? '+' : ''}${forecast.delta} (${forecast.delta_percent >= 0 ? '+' : ''}${forecast.delta_percent}%)
            </strong>
          </div>
        </div>

        <!-- 4. Dataset Recorded Range & Statistics -->
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Occupancy Range</span>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 14"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" style="font-size: 1.45rem;">
              ${Math.round(stats.min).toLocaleString()} – ${Math.round(stats.max).toLocaleString()}
            </span>
          </div>
          <div style="font-size: 0.775rem; color: var(--text-muted); margin: 0.4rem 0;">
            Average: <strong>${Math.round(stats.mean).toLocaleString()}</strong> | Median: <strong>${Math.round(stats.median).toLocaleString()}</strong>
          </div>
          <div class="kpi-bottom">
            <span>Dataset</span>
            <span class="status-badge info">KLCC Facility</span>
          </div>
        </div>
      </div>

      <!-- Central Section: Occupancy Trend & Dataset Breakdown -->
      <div class="dashboard-grid">
        <!-- Main Line Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Occupancy Trend & Prediction
              </h2>
              <p class="card-subtitle">Actual recorded occupancy from the dataset compared with the model forecast</p>
            </div>
            <div class="time-filter-group" id="dashboardTrendFilters">
              <button class="time-filter-btn ${this.activeFilter === '24h' ? 'active' : ''}" data-filter="24h">Past 24h</button>
              <button class="time-filter-btn ${this.activeFilter === '7d' ? 'active' : ''}" data-filter="7d">Past 7 Days</button>
              <button class="time-filter-btn ${this.activeFilter === '30d' ? 'active' : ''}" data-filter="30d">Past 30 Days</button>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrapper">
              <canvas id="dashboardTrendChart"></canvas>
            </div>
          </div>
          <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Data: <code>parking-klcc-2016-2017.txt</code></span>
            <span>Model: <strong>Gradient Boosting Regressor</strong></span>
          </div>
        </div>

        <!-- Real Dataset Breakdown (Replaces fake sector telemetry) -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Dataset Breakdown
              </h2>
              <p class="card-subtitle">Distribution of all 47,605 records in the dataset</p>
            </div>
            <span class="telemetry-pill">
              KLCC Dataset
            </span>
          </div>
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div style="display: flex; flex-direction: column; gap: 1.15rem;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.825rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Numeric Occupancy Records</span>
                  <span>${summary.numeric_records.toLocaleString()} (${numPct}%)</span>
                </div>
                <div class="kpi-progress" style="margin: 0;">
                  <div class="kpi-progress-bar" style="width: ${numPct}%; background-color: var(--brand-primary);"></div>
                </div>
                <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.2rem;">Used for training the regression model</div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.825rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>"OPEN" Status Records</span>
                  <span>${summary.open_records.toLocaleString()} (${openPct}%)</span>
                </div>
                <div class="kpi-progress" style="margin: 0;">
                  <div class="kpi-progress-bar" style="width: ${openPct}%; background-color: var(--status-low);"></div>
                </div>
                <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.2rem;">Non-numeric entry indicating parking open</div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.825rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>"FULL" Status Records</span>
                  <span>${summary.full_records.toLocaleString()} (${fullPct}%)</span>
                </div>
                <div class="kpi-progress" style="margin: 0;">
                  <div class="kpi-progress-bar" style="width: ${fullPct}%; background-color: var(--status-full);"></div>
                </div>
                <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.2rem;">Non-numeric entry indicating parking full</div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span>Parking Demand Note: Highest occupancy typically occurs during night hours and weekends.</span>
          </div>
        </div>
      </div>

      <!-- Real Dataset Entries Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Recent Dataset Entries
            </h2>
            <p class="card-subtitle">Latest chronological parking observations recorded in the dataset</p>
          </div>
          <span style="font-size: 0.775rem; color: var(--text-muted);">
            Parking Activity
          </span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Facility</th>
                <th>Recorded Occupancy</th>
                <th>Change in Occupancy</th>
                <th>Parking Activity</th>
                <th>Dataset Source</th>
              </tr>
            </thead>
            <tbody>
              ${d.recent_observations.map(row => `
                <tr>
                  <td style="font-family: var(--font-mono); font-size: 0.8rem;">${row.timestamp}</td>
                  <td><strong>KLCC</strong></td>
                  <td style="font-weight: 700; font-size: 0.95rem;">${row.occupancy.toLocaleString()}</td>
                  <td>
                    <span class="flow-pill ${row.delta >= 0 ? 'flow-in' : 'flow-out'}">
                      ${row.delta >= 0 ? '▲ +' : '▼ '}${row.delta}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge low">
                      ${row.state}
                    </span>
                  </td>
                  <td style="color: var(--text-muted); font-size: 0.775rem;">parking-klcc-2016-2017.txt</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render chart with initial filter data
    setTimeout(() => {
      this.updateTrendChart();
    }, 50);

    // Filter button handlers
    const filterBtns = container.querySelectorAll('#dashboardTrendFilters button');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-filter');
        this.updateTrendChart();
      });
    });

    // Refresh button
    const refreshBtn = container.querySelector('#btnRefreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `Refreshing...`;
        try {
          this.dataCache = await ParkSightData.fetchDashboardData();
          this.renderContent(container, this.dataCache);
          showToast("Dashboard reloaded with latest dataset values.");
        } catch (e) {
          showToast("Error reloading dashboard data: " + e.message);
        }
      });
    }
  },

  updateTrendChart() {
    if (!this.dataCache || !this.dataCache.trend_data) return;
    const currentData = this.dataCache.trend_data[this.activeFilter];
    ParkSightCharts.renderDashboardTrend('dashboardTrendChart', currentData);
  }
};

window.DashboardView = DashboardView;
