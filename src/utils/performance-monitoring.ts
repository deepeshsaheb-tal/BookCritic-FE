/**
 * Performance monitoring utilities to track and report web vitals
 */

import { ReportHandler } from 'web-vitals';

// Define performance metrics types
type PerformanceMetric = {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
};

// Store metrics for later analysis
const metrics: Record<string, PerformanceMetric> = {};

/**
 * Send metrics to an analytics endpoint
 */
const sendToAnalytics = (metric: PerformanceMetric): void => {
  // In production, this would send to a real analytics service
  // For now, we'll just log to console and store in memory
  console.log(`Performance Metric: ${metric.name}`, metric);
  
  // Store the metric
  metrics[metric.name] = metric;
  
  // Example of sending to an analytics endpoint
  // const body = JSON.stringify({ name: metric.name, value: metric.value, id: metric.id });
  // navigator.sendBeacon('/analytics', body);
};

/**
 * Get all collected metrics
 */
export const getCollectedMetrics = (): Record<string, PerformanceMetric> => {
  return { ...metrics };
};

/**
 * Report web vitals metrics
 */
export const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry); // Cumulative Layout Shift
      getFID(onPerfEntry); // First Input Delay
      getFCP(onPerfEntry); // First Contentful Paint
      getLCP(onPerfEntry); // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (): void => {
  // Report web vitals
  reportWebVitals(sendToAnalytics);
  
  // Add performance observer for navigation timing
  if ('PerformanceObserver' in window) {
    try {
      const perfObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            // Calculate key metrics
            const pageLoadTime = navEntry.loadEventEnd - navEntry.startTime;
            const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
            const timeToInteractive = navEntry.domInteractive - navEntry.startTime;
            
            // Log metrics
            console.log('Navigation Performance:', {
              pageLoadTime: `${pageLoadTime.toFixed(0)}ms`,
              domContentLoaded: `${domContentLoaded.toFixed(0)}ms`,
              timeToInteractive: `${timeToInteractive.toFixed(0)}ms`,
              cacheStatus: navEntry.transferSize === 0 ? 'cached' : 'not-cached'
            });
          }
        }
      });
      
      perfObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.error('Performance monitoring error:', e);
    }
  }
  
  // Track resource loading performance
  if ('PerformanceObserver' in window) {
    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const resources = entryList.getEntries().filter(entry => {
          // Filter out analytics and tracking resources
          return !entry.name.includes('analytics') && 
                 !entry.name.includes('tracking') &&
                 !entry.name.includes('beacon');
        });
        
        if (resources.length > 0) {
          // Group by resource type
          const byType: Record<string, PerformanceResourceTiming[]> = {};
          resources.forEach(res => {
            const entry = res as PerformanceResourceTiming;
            const type = entry.initiatorType;
            if (!byType[type]) byType[type] = [];
            byType[type].push(entry);
          });
          
          // Log slow resources (over 1s)
          const slowResources = resources.filter(res => {
            const duration = res.duration;
            return duration > 1000;
          });
          
          if (slowResources.length > 0) {
            console.warn('Slow resources detected:', 
              slowResources.map(res => ({ 
                name: res.name.split('/').pop(), 
                duration: `${res.duration.toFixed(0)}ms` 
              }))
            );
          }
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.error('Resource performance monitoring error:', e);
    }
  }
};

/**
 * Check if the page meets the performance target (< 2s load time on mobile)
 */
export const checkPerformanceTarget = (): boolean => {
  if (!metrics.LCP) return false;
  
  // For mobile performance, we primarily care about LCP (Largest Contentful Paint)
  // Google considers < 2.5s as "good", but our target is < 2s
  return metrics.LCP.value < 2000;
};

/**
 * Get performance recommendations based on collected metrics
 */
export const getPerformanceRecommendations = (): string[] => {
  const recommendations: string[] = [];
  
  if (!metrics.LCP || metrics.LCP.value > 2000) {
    recommendations.push('Optimize Largest Contentful Paint (LCP) - consider further image optimization or server-side rendering');
  }
  
  if (!metrics.CLS || metrics.CLS.value > 0.1) {
    recommendations.push('Improve Cumulative Layout Shift (CLS) - add size attributes to images and avoid inserting content above existing content');
  }
  
  if (!metrics.FID || metrics.FID.value > 100) {
    recommendations.push('Reduce First Input Delay (FID) - minimize JavaScript execution time and break up long tasks');
  }
  
  return recommendations;
};
