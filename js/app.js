/**
 * ParkSight - Main Application Orchestrator & Client-Side Router
 * Manages hash routing, view mounting, navigation states, and global notifications.
 */

class ParkSightApp {
  constructor() {
    this.routes = {
      '#dashboard': DashboardView,
      '#prediction': PredictionView,
      '#analytics': AnalyticsView,
      '#about': AboutView
    };

    this.defaultRoute = '#dashboard';
    this.currentRoute = null;
    this.mainContainer = document.getElementById('viewContent');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.mobileMenuBtn = document.getElementById('mobileMenuToggle');
    this.navLinksContainer = document.getElementById('navLinksContainer');
    this.toastEl = document.getElementById('globalToast');
  }

  init() {
    // 1. Initialize Chart defaults
    if (window.ParkSightCharts) {
      ParkSightCharts.initGlobalDefaults();
    }

    // 2. Set up routing listeners
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());

    // 3. Mobile menu toggle
    if (this.mobileMenuBtn && this.navLinksContainer) {
      this.mobileMenuBtn.addEventListener('click', () => {
        this.navLinksContainer.classList.toggle('mobile-open');
      });
    }

    // 4. Close mobile menu on route link click
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.navLinksContainer) {
          this.navLinksContainer.classList.remove('mobile-open');
        }
      });
    });

    // 5. Initial routing check
    if (!window.location.hash || !this.routes[window.location.hash]) {
      window.location.hash = this.defaultRoute;
    } else {
      this.handleRoute();
    }

    // 6. Update timestamp indicator
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);
  }

  handleRoute() {
    const hash = window.location.hash || this.defaultRoute;
    const view = this.routes[hash] || this.routes[this.defaultRoute];
    const targetHash = this.routes[hash] ? hash : this.defaultRoute;

    this.currentRoute = targetHash;

    // Update active nav links
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === targetHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mount view
    if (this.mainContainer && view) {
      // Scroll to top
      window.scrollTo(0, 0);

      // Render view content
      this.mainContainer.classList.remove('active');
      view.render(this.mainContainer);
      this.mainContainer.classList.add('active');
    }
  }

  updateClock() {
    const el = document.getElementById('telemetryClock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Local';
    }
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 3200);
  }
}

// Global toast helper
window.showToast = function(msg) {
  if (window.appInstance) {
    window.appInstance.showToast(msg);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new ParkSightApp();
  window.appInstance.init();
});
