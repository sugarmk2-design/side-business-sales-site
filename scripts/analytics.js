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

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
}());
