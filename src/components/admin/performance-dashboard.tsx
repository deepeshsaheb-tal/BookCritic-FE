import React, { useEffect, useState } from 'react';
import { getCollectedMetrics, getPerformanceRecommendations, checkPerformanceTarget } from '../../utils/performance-monitoring.ts';

/**
 * Performance Dashboard component for monitoring and visualizing web performance metrics
 * This is intended for admin/developer use to track performance improvements
 */
export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [targetMet, setTargetMet] = useState<boolean | null>(null);
  const [navigationTiming, setNavigationTiming] = useState<any>(null);

  useEffect(() => {
    // Get collected metrics
    const updateMetrics = () => {
      const collectedMetrics = getCollectedMetrics();
      setMetrics(collectedMetrics);
      setRecommendations(getPerformanceRecommendations());
      setTargetMet(checkPerformanceTarget());
    };

    // Get navigation timing data
    const getNavigationTiming = () => {
      if (window.performance && window.performance.getEntriesByType) {
        const navEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
          setNavigationTiming({
            pageLoadTime: navEntry.loadEventEnd - navEntry.startTime,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
            timeToInteractive: navEntry.domInteractive - navEntry.startTime,
            cacheStatus: navEntry.transferSize === 0 ? 'cached' : 'not-cached'
          });
        }
      }
    };

    // Initial update
    updateMetrics();
    getNavigationTiming();

    // Update metrics every 5 seconds
    const intervalId = setInterval(updateMetrics, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Format milliseconds to a readable format
  const formatMs = (ms: number): string => {
    if (!ms) return 'N/A';
    return `${ms.toFixed(1)}ms`;
  };

  // Get status color based on value
  const getStatusColor = (name: string, value: number): string => {
    if (!value) return 'bg-gray-200';
    
    switch (name) {
      case 'LCP': // Largest Contentful Paint
        return value < 2000 ? 'bg-green-500' : value < 4000 ? 'bg-yellow-500' : 'bg-red-500';
      case 'FID': // First Input Delay
        return value < 100 ? 'bg-green-500' : value < 300 ? 'bg-yellow-500' : 'bg-red-500';
      case 'CLS': // Cumulative Layout Shift
        return value < 0.1 ? 'bg-green-500' : value < 0.25 ? 'bg-yellow-500' : 'bg-red-500';
      case 'FCP': // First Contentful Paint
        return value < 1000 ? 'bg-green-500' : value < 3000 ? 'bg-yellow-500' : 'bg-red-500';
      case 'TTFB': // Time to First Byte
        return value < 500 ? 'bg-green-500' : value < 1500 ? 'bg-yellow-500' : 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Performance Dashboard</h2>
      
      {/* Target Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Performance Target Status</h3>
        <div className={`p-4 rounded-md ${
          targetMet === null ? 'bg-gray-100' : 
          targetMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {targetMet === null ? 'Collecting data...' : 
           targetMet ? '✅ Target Met: Page load time under 2 seconds on mobile' : 
           '❌ Target Not Met: Page load time exceeds 2 seconds on mobile'}
        </div>
      </div>
      
      {/* Core Web Vitals */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['LCP', 'FID', 'CLS'].map(metric => (
            <div key={metric} className="p-4 bg-gray-50 rounded-md shadow">
              <div className="flex justify-between items-center">
                <span className="font-medium">{metric}</span>
                <span className={`px-2 py-1 rounded-full text-white text-xs ${
                  getStatusColor(metric, metrics[metric]?.value)
                }`}>
                  {metrics[metric] ? formatMs(metrics[metric].value) : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {metric === 'LCP' && 'Largest Contentful Paint - time until largest content element is visible'}
                {metric === 'FID' && 'First Input Delay - time until browser responds to user interaction'}
                {metric === 'CLS' && 'Cumulative Layout Shift - measure of visual stability'}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Additional Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['FCP', 'TTFB'].map(metric => (
            <div key={metric} className="p-4 bg-gray-50 rounded-md shadow">
              <div className="flex justify-between items-center">
                <span className="font-medium">{metric}</span>
                <span className={`px-2 py-1 rounded-full text-white text-xs ${
                  getStatusColor(metric, metrics[metric]?.value)
                }`}>
                  {metrics[metric] ? formatMs(metrics[metric].value) : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {metric === 'FCP' && 'First Contentful Paint - time until first content is visible'}
                {metric === 'TTFB' && 'Time To First Byte - time until first byte is received'}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Timing */}
      {navigationTiming && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Navigation Timing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-md shadow">
              <div className="font-medium">Page Load Time</div>
              <div className="text-xl mt-1">{formatMs(navigationTiming.pageLoadTime)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow">
              <div className="font-medium">DOM Content Loaded</div>
              <div className="text-xl mt-1">{formatMs(navigationTiming.domContentLoaded)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow">
              <div className="font-medium">Time to Interactive</div>
              <div className="text-xl mt-1">{formatMs(navigationTiming.timeToInteractive)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md shadow">
              <div className="font-medium">Cache Status</div>
              <div className="text-xl mt-1 capitalize">{navigationTiming.cacheStatus}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Performance Recommendations</h3>
          <ul className="list-disc pl-5 space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
