// HLPFL Link-in-Bio Analytics and Interactions

class HLPFLAnalytics {
  constructor() {
    this.init();
  }

  init() {
    this.setupAnalytics();
    this.setupLinkTracking();
    this.setupInteractions();
    this.loadStats();
  }

  setupAnalytics() {
    // Simple analytics tracking
    this.analytics = {
      clicks: this.getStoredClicks(),
      sessions: this.getSessions(),
      bounceRate: this.calculateBounceRate(),
    };
  }

  setupLinkTracking() {
    const links = document.querySelectorAll(".link-item");

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        this.trackLinkClick(link);
        this.animateClick(link);
      });

      // Add hover effect for better UX
      link.addEventListener("mouseenter", () => {
        this.addHoverEffect(link);
      });

      link.addEventListener("mouseleave", () => {
        this.removeHoverEffect(link);
      });
    });
  }

  setupInteractions() {
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Add keyboard navigation
    this.setupKeyboardNavigation();

    // Add touch gestures for mobile
    this.setupTouchGestures();
  }

  trackLinkClick(link) {
    const linkId = link.dataset.linkId;
    const linkTitle = link.querySelector(".link-title").textContent;
    const linkClass = link.className;

    // Update click count
    this.analytics.clicks[linkId] = (this.analytics.clicks[linkId] || 0) + 1;
    this.storeClicks(this.analytics.clicks);

    // Music-specific tracking
    if (linkClass.includes("music-link")) {
      this.trackMusicInteraction(linkId, linkTitle);
    } else if (linkClass.includes("business-link")) {
      this.trackBusinessInteraction(linkId, linkTitle);
    }

    // Track event
    console.log(`Link clicked: ${linkTitle} (${linkId})`);

    // Send to analytics service (if configured)
    this.sendAnalyticsEvent("link_click", {
      linkId: linkId,
      linkTitle: linkTitle,
      timestamp: Date.now(),
    });
  }

  animateClick(element) {
    element.style.transform = "scale(0.98)";
    setTimeout(() => {
      element.style.transform = "";
    }, 150);
  }

  addHoverEffect(link) {
    // Add subtle hover animation
    link.style.transform = "translateY(-2px)";
  }

  removeHoverEffect(link) {
    link.style.transform = "";
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        // Enhance focus visibility
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });
  }

  setupTouchGestures() {
    let touchStartY = 0;

    document.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener("touchend", (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      // Simple swipe detection for future features
      if (Math.abs(diff) > 50) {
        console.log("Swipe detected");
      }
    });
  }

  loadStats() {
    // Animate stats on page load
    const statNumbers = document.querySelectorAll(".stat-number");

    const animateValue = (element, start, end, duration) => {
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (
          (increment > 0 && current >= end) ||
          (increment < 0 && current <= end)
        ) {
          current = end;
          clearInterval(timer);
        }

        element.textContent = this.formatNumber(Math.floor(current));
      }, 16);
    };

    // Intersection Observer for animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const finalValue = element.textContent;
            const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ""));
            const suffix = finalValue.replace(/[0-9]/g, "");

            animateValue(element, 0, numericValue, 1500);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 },
    );

    statNumbers.forEach((stat) => {
      observer.observe(stat);
    });
  }

  formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B+";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K+";
    return num.toString();
  }

  getStoredClicks() {
    const stored = localStorage.getItem("hlpfl_link_clicks");
    return stored ? JSON.parse(stored) : {};
  }

  storeClicks(clicks) {
    localStorage.setItem("hlpfl_link_clicks", JSON.stringify(clicks));
  }

  // Music-specific tracking methods
  trackMusicInteraction(linkId, linkTitle) {
    // Track music platform engagement
    const musicStats = this.getMusicStats();

    if (!musicStats.platforms) {
      musicStats.platforms = {};
    }

    musicStats.platforms[linkId] = (musicStats.platforms[linkId] || 0) + 1;
    musicStats.totalMusicClicks = (musicStats.totalMusicClicks || 0) + 1;

    this.storeMusicStats(musicStats);

    // Log for analytics
    console.log(`🎵 Music interaction: ${linkTitle} on ${linkId}`);

    // Show music-specific notification
    this.showMusicNotification(linkTitle, linkId);
  }

  trackBusinessInteraction(linkId, linkTitle) {
    // Track business tool engagement
    const businessStats = this.getBusinessStats();

    if (!businessStats.tools) {
      businessStats.tools = {};
    }

    businessStats.tools[linkId] = (businessStats.tools[linkId] || 0) + 1;
    businessStats.totalBusinessClicks =
      (businessStats.totalBusinessClicks || 0) + 1;

    this.storeBusinessStats(businessStats);

    // Log for analytics
    console.log(`🎤 Business interaction: ${linkTitle} on ${linkId}`);
  }

  getMusicStats() {
    const stored = localStorage.getItem("hlpfl_music_stats");
    return stored ? JSON.parse(stored) : {};
  }

  storeMusicStats(stats) {
    localStorage.setItem("hlpfl_music_stats", JSON.stringify(stats));
  }

  getBusinessStats() {
    const stored = localStorage.getItem("hlpfl_business_stats");
    return stored ? JSON.parse(stored) : {};
  }

  storeBusinessStats(stats) {
    localStorage.setItem("hlpfl_business_stats", JSON.stringify(stats));
  }

  showMusicNotification(platform, linkId) {
    // Create a subtle notification for music interactions
    const notification = document.createElement("div");
    notification.className = "music-notification";
    notification.innerHTML = `🎵 Opening ${platform}...`;
    notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: var(--white);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  getSessions() {
    const sessions = localStorage.getItem("hlpfl_sessions") || "0";
    const newSessions = parseInt(sessions) + 1;
    localStorage.setItem("hlpfl_sessions", newSessions.toString());
    return newSessions;
  }

  calculateBounceRate() {
    // Simple bounce rate calculation
    const sessions = this.getSessions();
    const totalClicks = Object.values(this.analytics.clicks).reduce(
      (sum, count) => sum + count,
      0,
    );
    return sessions > 0
      ? (((sessions - totalClicks) / sessions) * 100).toFixed(2)
      : 0;
  }

  sendAnalyticsEvent(eventName, data) {
    // Send to analytics service
    // This would be replaced with actual analytics service implementation
    console.log("Analytics Event:", eventName, data);

    // Example: Send to Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, data);
    }

    // Example: Send to custom endpoint
    if (typeof fetch !== "undefined") {
      fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventName,
          data: data,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      }).catch((err) => console.log("Analytics request failed:", err));
    }
  }

  // Public method to get analytics data
  getAnalytics() {
    return {
      ...this.analytics,
      topLinks: this.getTopLinks(),
      conversionRate: this.calculateConversionRate(),
    };
  }

  getTopLinks() {
    const clicks = this.analytics.clicks;
    return Object.entries(clicks)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([linkId, count]) => ({ linkId, count }));
  }

  calculateConversionRate() {
    const totalClicks = Object.values(this.analytics.clicks).reduce(
      (sum, count) => sum + count,
      0,
    );
    const sessions = this.analytics.sessions;
    return sessions > 0 ? ((totalClicks / sessions) * 100).toFixed(2) : 0;
  }
}

// Initialize analytics when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Create global analytics instance
  window.hlpflAnalytics = new HLPFLAnalytics();

  // Add loading complete
  document.body.classList.add("loaded");

  // Performance monitoring
  if ("performance" in window) {
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      console.log(`Page load time: ${loadTime}ms`);
    });
  }
});

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = HLPFLAnalytics;
}
