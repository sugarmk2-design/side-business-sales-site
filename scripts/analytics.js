(function () {
  const measurementId = "G-2R7BJ9XWKM";
  const isConfigured = /^G-[A-Z0-9]+$/.test(measurementId) && measurementId !== "G-XXXXXXXXXX";

  if (!isConfigured) {
    console.info("GA4 measurement ID is not configured. Replace G-XXXXXXXXXX in scripts/analytics.js.");
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  window.trackSiteEvent = function (eventName, params) {
    if (!eventName || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", eventName, params || {});
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const articleMatch = window.location.pathname.match(/\/articles\/([^/]+)\//);
  if (articleMatch) {
    window.trackSiteEvent("article_view", {
      article_id: articleMatch[1],
      page_path: window.location.pathname
    });
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-analytics-event]");
    if (!target) {
      return;
    }
    window.trackSiteEvent(target.dataset.analyticsEvent, {
      article_id: target.dataset.articleId || "",
      link_url: target.href || "",
      link_text: target.textContent.trim()
    });
  });

  const scrollState = { scroll_50: false, scroll_90: false };
  window.addEventListener("scroll", function () {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      return;
    }
    const depth = Math.round((window.scrollY / maxScroll) * 100);
    if (!scrollState.scroll_50 && depth >= 50) {
      scrollState.scroll_50 = true;
      window.trackSiteEvent("scroll_50", { page_path: window.location.pathname });
    }
    if (!scrollState.scroll_90 && depth >= 90) {
      scrollState.scroll_90 = true;
      window.trackSiteEvent("scroll_90", { page_path: window.location.pathname });
    }
  }, { passive: true });
}());
