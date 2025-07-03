import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: WebVitalsData) {
  // Send to your analytics service (Google Analytics, Sentry, etc.)
  const body = JSON.stringify(metric);
  
  // Send to Sentry if available
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.metrics.increment('web_vitals', {
      tags: {
        metric: metric.name,
        rating: metric.rating,
      },
      value: metric.value,
    });
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to your own API endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).catch(console.error);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric);
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Custom performance observer for additional metrics
export function observePerformanceMetrics() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Observe First Input Delay (FID)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const fid = entry as PerformanceEventTiming;
          sendToAnalytics({
            name: 'FID',
            value: fid.processingStart - fid.startTime,
            rating: fid.processingStart - fid.startTime < 100 ? 'good' : 
                   fid.processingStart - fid.startTime < 300 ? 'needs-improvement' : 'poor',
            delta: 0,
            id: fid.name,
          });
        }
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    console.error('Error observing FID:', error);
  }

  // Observe Largest Contentful Paint (LCP)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry as PerformanceEntry;
          sendToAnalytics({
            name: 'LCP',
            value: lcp.startTime,
            rating: lcp.startTime < 2500 ? 'good' : 
                   lcp.startTime < 4000 ? 'needs-improvement' : 'poor',
            delta: 0,
            id: lcp.name || 'unknown',
          });
        }
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    console.error('Error observing LCP:', error);
  }

  // Observe Cumulative Layout Shift (CLS)
  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });

    // Report CLS when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendToAnalytics({
          name: 'CLS',
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' : 
                 clsValue < 0.25 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: 'cls-final',
        });
      }
    });
  } catch (error) {
    console.error('Error observing CLS:', error);
  }
} 