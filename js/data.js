/**
 * ParkSight - Data & State Store
 * 
 * Provides structured placeholder data, time-series metrics, and prediction engine.
 * Modular design facilitates seamless future integration with Python ML API (FastAPI / Flask).
 */

const ParkSightData = {
  facility: {
    name: "KLCC Central Parking Complex",
    totalCapacity: 2500,
    activeLevels: ["Level P1 - North Bay", "Level P2 - South Bay", "Level P3 - East Express", "Level B1 - West Concourse"],
    updateIntervalSeconds: 15,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  },

  // Current Dashboard Status (Realistic snapshot)
  currentStatus: {
    occupancy: 1785,
    capacity: 2500,
    get available() { return this.capacity - this.occupancy; },
    get occupancyRate() { return ((this.occupancy / this.capacity) * 100).toFixed(1); },
    forecastNextHour: 1940,
    get forecastDelta() { return this.forecastNextHour - this.occupancy; },
    get forecastDeltaPercent() { return (((this.forecastNextHour - this.occupancy) / this.occupancy) * 100).toFixed(1); },
    statusCategory: "Moderate",
    peakExpectedTime: "14:00 - 15:30",
    peakExpectedOccupancy: 2210
  },

  // Helper to determine status category based on percentage
  getStatusCategory(percent) {
    if (percent < 50) return { label: "Low", class: "low", desc: "Abundant parking available" };
    if (percent < 75) return { label: "Moderate", class: "moderate", desc: "Steady vehicular inflow" };
    if (percent < 90) return { label: "High", class: "high", desc: "Limited parking available" };
    return { label: "Near Full", class: "full", desc: "Critical congestion expected" };
  },

  // Dashboard 24-Hour Trend Series (Actual vs Forecasted)
  getDashboardTrendData(filter = '24h') {
    if (filter === '7d') {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const actual = [1820, 1890, 1940, 2010, 2180, 2290, 1680];
      const forecast = [1800, 1870, 1960, 2030, 2150, 2320, 1650];
      return { labels, actual, forecast, capacity: 2500 };
    }
    
    if (filter === '30d') {
      const labels = Array.from({ length: 15 }, (_, i) => `Day ${(i + 1) * 2}`);
      const actual = [1750, 1820, 1940, 2100, 1890, 1920, 2250, 2180, 1850, 1960, 2210, 2340, 1790, 1860, 2050];
      const forecast = [1730, 1840, 1910, 2080, 1910, 1940, 2220, 2190, 1830, 1980, 2190, 2360, 1770, 1880, 2020];
      return { labels, actual, forecast, capacity: 2500 };
    }

    // Default: 24 Hours (Past 14h actual, Next 6h predicted)
    const labels = [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', 
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ];
    // Values representing 24-hr movement in KLCC facility
    const actual = [410, 280, 220, 540, 1420, 1680, 1920, 2150, 1890, 1785, null, null];
    const forecast = [null, null, null, null, null, null, null, null, null, 1785, 1940, 1820];
    
    return {
      labels,
      actual,
      forecast,
      capacity: 2500
    };
  },

  // Recent Inflow / Outflow Telemetry Table Data
  recentActivity: [
    { id: "LOG-8942", time: "2 mins ago", zone: "Level P1 - North Bay", type: "Inflow Spike", rate: "+38 veh/15m", occupancy: "640 / 750", pct: 85.3, status: "high" },
    { id: "LOG-8941", time: "6 mins ago", zone: "Level P2 - South Bay", type: "Stable Flow", rate: "+12 veh/15m", occupancy: "480 / 650", pct: 73.8, status: "moderate" },
    { id: "LOG-8940", time: "11 mins ago", zone: "Level P3 - East Express", type: "Steady Flow", rate: "-8 veh/15m", occupancy: "395 / 600", pct: 65.8, status: "moderate" },
    { id: "LOG-8939", time: "16 mins ago", zone: "Level B1 - West Concourse", type: "Outflow", rate: "-22 veh/15m", occupancy: "270 / 500", pct: 54.0, status: "low" },
    { id: "LOG-8938", time: "21 mins ago", zone: "Level P1 - North Bay", type: "Inflow", rate: "+26 veh/15m", occupancy: "614 / 750", pct: 81.8, status: "high" }
  ],

  // Analytics: Hourly Distribution
  hourlyOccupancy: {
    hours: [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ],
    averageOccupancy: [
      380, 290, 240, 210, 230, 420,
      860, 1340, 1720, 1850, 1980, 2120,
      2280, 2240, 2160, 2040, 1920, 1860,
      1740, 1610, 1380, 1050, 780, 520
    ],
    peakCapacityThreshold: 2250
  },

  // Analytics: Weekday vs Weekend Comparison
  weekdayWeekendComparison: {
    intervals: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    weekday: [1680, 1890, 2240, 2190, 1950, 1780, 1420, 850],
    weekend: [620, 1150, 1840, 2280, 2390, 2260, 1980, 1320]
  },

  // Analytics: Historical 30-Day Trend
  monthlyTrend: {
    labels: Array.from({ length: 30 }, (_, i) => `Sep ${i + 1}`),
    occupancyRates: [
      68, 71, 74, 82, 86, 78, 62, 70, 73, 76, 84, 88, 79, 64, 
      69, 72, 77, 85, 89, 81, 65, 71, 75, 78, 86, 91, 83, 67, 72, 75
    ]
  },

  // Analytics & About: Model Evaluation Metrics
  modelMetrics: {
    bestModel: "Gradient Boosting Regressor",
    metrics: [
      { name: "MAE", value: "24.3", unit: "spaces", desc: "Mean Absolute Error" },
      { name: "RMSE", value: "36.8", unit: "spaces", desc: "Root Mean Squared Error" },
      { name: "R² Score", value: "0.942", unit: "out of 1.0", desc: "Variance Explained" },
      { name: "MAPE", value: "2.8%", unit: "relative error", desc: "Mean Absolute % Error" }
    ],
    comparisonTable: [
      { model: "Gradient Boosting Regressor", mae: "24.3", rmse: "36.8", r2: "0.942", isBest: true },
      { model: "Random Forest Regressor", mae: "28.1", rmse: "42.5", r2: "0.926", isBest: false },
      { model: "Linear Regression", mae: "58.4", rmse: "79.3", r2: "0.785", isBest: false }
    ],
    featureImportance: [
      { feature: "Previous_Occupancy", weight: 99.44, description: "Vehicle count from previous 15-minute interval" },
      { feature: "Hour", weight: 0.47, description: "Diurnal parking demand cycle" },
      { feature: "Rolling_Average_3", weight: 0.04, description: "Smoothed momentum over previous 45 minutes" },
      { feature: "Is_Weekend", weight: 0.02, description: "Weekday vs weekend behavioral split" },
      { feature: "Day", weight: 0.01, description: "Day of month" },
      { feature: "Day_of_Week", weight: 0.01, description: "Day of week index" },
      { feature: "Month", weight: 0.01, description: "Monthly demand shifts" }
    ]
  },

  // Simulation engine based on the exact features:
  // ['Hour', 'Day', 'Month', 'Day_of_Week', 'Is_Weekend', 'Previous_Occupancy', 'Rolling_Average_3']
  simulatePrediction(inputs) {
    const { dateStr, timeStr, previousOccupancy, rollingAverage } = inputs;
    
    // Parse date and time
    const dateObj = new Date(`${dateStr}T${timeStr}`);
    const hour = dateObj.getHours() + (dateObj.getMinutes() / 60);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0;
    
    const prev = parseFloat(previousOccupancy) || 1600;
    const roll = parseFloat(rollingAverage) || 1650;

    // Time of day curve (Hour weight)
    let timeDemandMultiplier = 0.4;
    if (hour >= 7 && hour < 11) {
      timeDemandMultiplier = 0.85 + (isWeekend ? -0.2 : 0.1); // Morning peak
    } else if (hour >= 11 && hour < 15) {
      timeDemandMultiplier = 0.95; // Midday peak
    } else if (hour >= 15 && hour < 19) {
      timeDemandMultiplier = 0.88 + (isWeekend ? 0.08 : -0.05); // Evening shopping
    } else if (hour >= 19 && hour < 23) {
      timeDemandMultiplier = 0.60;
    } else {
      timeDemandMultiplier = 0.20; // Night
    }

    // Blend features realistically:
    // Model weight: 45% lag features + 35% rolling average + 20% temporal demand
    const temporalTarget = 2500 * timeDemandMultiplier;
    let predictedRaw = (prev * 0.42) + (roll * 0.38) + (temporalTarget * 0.20);
    
    // Small stochastic noise variance (deterministic based on minute)
    const variance = (dateObj.getMinutes() % 7) - 3;
    let finalOccupancy = Math.round(predictedRaw + variance);

    // Clamp within bounds
    finalOccupancy = Math.max(80, Math.min(2480, finalOccupancy));
    
    const capacity = this.facility.totalCapacity;
    const available = capacity - finalOccupancy;
    const occupancyPercent = ((finalOccupancy / capacity) * 100).toFixed(1);
    const status = this.getStatusCategory(parseFloat(occupancyPercent));

    return {
      predictedOccupancy: finalOccupancy,
      capacity,
      availableSpaces: available,
      occupancyPercent: parseFloat(occupancyPercent),
      status: status.label,
      statusClass: status.class,
      confidenceInterval: "± 28 spaces (95% CI)",
      inferenceLatency: "11.2 ms",
      modelUsed: "Gradient Boosting Regressor v1.0",
      inputs: {
        dateStr,
        timeStr,
        hour: Math.round(hour * 10) / 10,
        day,
        month,
        dayOfWeek,
        isWeekend,
        previousOccupancy: prev,
        rollingAverage: roll
      },
      contributions: [
        { name: "Previous Occupancy (Lag-1)", impact: "+42%", value: `${prev} bays` },
        { name: "3-Period Rolling Trend", impact: "+35%", value: `${roll} bays avg` },
        { name: "Temporal Diurnal Factor", impact: hour >= 11 && hour <= 14 ? "+18%" : "-12%", value: `${timeStr} (${isWeekend ? 'Weekend' : 'Weekday'})` }
      ]
    };
  },

  // Defined nominal capacity for occupancy calculation
  nominalCapacity: 2500,

  /**
   * Resolve configurable API Base URL.
   * Priority:
   * 1. window.API_BASE_URL / window.PARKSIGHT_API_BASE_URL / window.__ENV__.API_BASE_URL
   * 2. <meta name="api-base-url" content="..."> in document head
   * 3. localStorage 'API_BASE_URL' / 'PARKSIGHT_API_BASE_URL'
   * 4. Default: '' (relative to current origin, works seamlessly when served by FastAPI)
   */
  getApiBaseUrl() {
    if (typeof window !== 'undefined') {
      if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.trim() !== '') {
        return window.API_BASE_URL.trim().replace(/\/+$/, '');
      }
      if (typeof window.PARKSIGHT_API_BASE_URL === 'string' && window.PARKSIGHT_API_BASE_URL.trim() !== '') {
        return window.PARKSIGHT_API_BASE_URL.trim().replace(/\/+$/, '');
      }
      if (window.__ENV__ && typeof window.__ENV__.API_BASE_URL === 'string' && window.__ENV__.API_BASE_URL.trim() !== '') {
        return window.__ENV__.API_BASE_URL.trim().replace(/\/+$/, '');
      }
      const metaTag = document.querySelector('meta[name="api-base-url"]');
      if (metaTag && metaTag.content && !metaTag.content.startsWith('%') && metaTag.content.trim() !== '') {
        return metaTag.content.trim().replace(/\/+$/, '');
      }
      try {
        const stored = localStorage.getItem('API_BASE_URL') || localStorage.getItem('PARKSIGHT_API_BASE_URL');
        if (stored && stored.trim() !== '') {
          return stored.trim().replace(/\/+$/, '');
        }
      } catch (e) {
        // Ignore localStorage restrictions
      }
    }
    return '';
  },

  /**
   * Helper to format full API URL using configurable base URL
   */
  getApiUrl(endpoint) {
    const base = this.getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
  },

  /**
   * Real Python Backend Integration
   * Sends the 7 features in exact training order to POST /api/predict:
   * ['Hour', 'Day', 'Month', 'Day_of_Week', 'Is_Weekend', 'Previous_Occupancy', 'Rolling_Average_3']
   */
  async predictViaBackend(payload) {
    const { dateStr, timeStr, previousOccupancy, rollingAverage } = payload;
    
    // Parse date and time accurately
    const [year, monthStr, dayStr] = dateStr.split('-');
    const [hourStr, minStr] = timeStr.split(':');
    
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const hour = parseInt(hourStr, 10) + (parseInt(minStr || '0', 10) / 60.0);
    
    // In Python datetime: Monday is 0, Sunday is 6
    // JS getDay(): Sunday is 0, Monday is 1, ..., Saturday is 6
    const dateObj = new Date(parseInt(year, 10), month - 1, day);
    const jsDay = dateObj.getDay();
    const dayOfWeek = (jsDay === 0) ? 6 : jsDay - 1; // 0=Mon, 1=Tue, ..., 6=Sun
    const isWeekend = (dayOfWeek >= 5) ? 1 : 0;
    
    const prev = parseFloat(previousOccupancy);
    const roll = parseFloat(rollingAverage);

    if (isNaN(prev) || prev < 0) {
      throw new Error("Previous Occupancy must be a valid non-negative number.");
    }
    if (isNaN(roll) || roll < 0) {
      throw new Error("Recent Average Occupancy must be a valid non-negative number.");
    }

    const featurePayload = {
      Hour: Math.round(hour * 100) / 100,
      Day: day,
      Month: month,
      Day_of_Week: dayOfWeek,
      Is_Weekend: isWeekend,
      Previous_Occupancy: prev,
      Rolling_Average_3: roll
    };

    const response = await fetch(this.getApiUrl('/api/predict'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(featurePayload)
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const detail = errorJson.detail || `Server returned error status ${response.status}`;
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }

    const data = await response.json();
    return {
      predictedOccupancy: data.predicted_occupancy,
      modelType: data.model_type,
      featuresUsed: data.features_used,
      inputs: featurePayload,
      meta: {
        dateStr,
        timeStr,
        dayOfWeekName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOfWeek]
      }
    };
  },

  /**
   * Fetch Real Dashboard Dataset & Forecast Metrics
   */
  async fetchDashboardData() {
    const res = await fetch(this.getApiUrl('/api/dashboard'));
    if (!res.ok) {
      throw new Error(`Failed to load dashboard data (HTTP ${res.status})`);
    }
    return await res.json();
  },

  /**
   * Fetch Real Analytics Calculations & Model Evaluations
   */
  async fetchAnalyticsData() {
    const res = await fetch(this.getApiUrl('/api/analytics'));
    if (!res.ok) {
      throw new Error(`Failed to load analytics data (HTTP ${res.status})`);
    }
    return await res.json();
  }
};

window.ParkSightData = ParkSightData;
