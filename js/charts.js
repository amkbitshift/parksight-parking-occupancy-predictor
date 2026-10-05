/**
 * ParkSight - Charts Manager
 * High-performance, clean charts configured with professional SaaS visual aesthetic.
 * Built on Chart.js with responsive sizing and real dataset/model figures.
 */

const ParkSightCharts = {
  instances: {},

  // Clean Chart.js default theme configuration
  initGlobalDefaults() {
    if (typeof Chart === 'undefined') {
      console.warn("Chart.js is not loaded yet.");
      return;
    }

    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif';
    Chart.defaults.font.size = 11;
    Chart.defaults.color = '#64748b';
    Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a';
    Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyColor = '#f1f5f9';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
  },

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  // 1. Dashboard Trend Chart (Real Historical Occupancy vs Model Forecast)
  renderDashboardTrend(canvasId, trendData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !trendData) return;

    const ctx = canvas.getContext('2d');
    const datasets = [
      {
        label: 'Recorded Occupancy',
        data: trendData.actual,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29, 78, 216, 0.08)',
        borderWidth: 2.2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#1d4ed8',
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ];

    if (trendData.forecast && trendData.forecast.some(v => v !== null && v !== undefined)) {
      datasets.push({
        label: 'Next-Period Model Forecast',
        data: trendData.forecast,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        borderWidth: 2.2,
        borderDash: [5, 4],
        tension: 0.3,
        fill: false,
        pointBackgroundColor: '#059669',
        pointRadius: 4,
        pointHoverRadius: 6
      });
    }

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 14,
              font: { weight: 500, size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.raw === null || context.raw === undefined) return '';
                return `${context.dataset.label}: ${Math.round(context.raw).toLocaleString()} vehicles`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, maxTicksLimit: 12 }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: val => val.toLocaleString()
            }
          }
        }
      }
    });
  },

  // 2. Analytics: 24-Hour Occupancy Curve (Actual Dataset Mean by Hour)
  renderHourlyOccupancy(canvasId, hourlyData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !hourlyData) return;

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hourlyData.hours,
        datasets: [
          {
            label: 'Average Recorded Occupancy',
            data: hourlyData.average_occupancy,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            borderWidth: 2.2,
            tension: 0.3,
            fill: true,
            pointRadius: 2.5,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${Math.round(context.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { callback: val => val.toLocaleString() }
          }
        }
      }
    });
  },

  // 3. Analytics: Weekday vs Weekend Comparison
  renderWeekdayVsWeekend(canvasId, compData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !compData) return;

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: compData.intervals,
        datasets: [
          {
            label: 'Weekday (Mon - Fri)',
            data: compData.weekday,
            backgroundColor: '#1d4ed8',
            borderRadius: 4,
            barPercentage: 0.7
          },
          {
            label: 'Weekend (Sat - Sun)',
            data: compData.weekend,
            backgroundColor: '#64748b',
            borderRadius: 4,
            barPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${Math.round(context.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => v.toLocaleString() }
          }
        }
      }
    });
  },

  // 4. Analytics: 30-Day Historical Trend
  renderHistoricalTrend(canvasId, trendData) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !trendData) return;

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: 'Daily Average Occupancy',
            data: trendData.values,
            borderColor: '#0f172a',
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
            borderWidth: 2,
            tension: 0.25,
            fill: true,
            pointRadius: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Recorded Daily Avg: ${Math.round(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => v.toLocaleString() }
          }
        }
      }
    });
  },

  // 5. Analytics: Feature Importance Horizontal Bar (Real Model Importances)
  renderFeatureImportance(canvasId, featList) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !featList) return;

    const labels = featList.map(item => item.feature);
    const values = featList.map(item => item.importance_pct);
    const ctx = canvas.getContext('2d');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Model Feature Importance (%)',
            data: values,
            backgroundColor: '#1d4ed8',
            borderRadius: 4,
            barThickness: 16
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Gini Importance: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: { callback: v => v + '%' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }
};

window.ParkSightCharts = ParkSightCharts;
