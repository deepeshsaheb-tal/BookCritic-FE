import { 
  reportWebVitals, 
  initPerformanceMonitoring, 
  getCollectedMetrics, 
  checkPerformanceTarget,
  getPerformanceRecommendations
} from '../performance-monitoring';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(cb => cb({ name: 'CLS', value: 0.05, delta: 0.05, id: 'cls-1', entries: [] })),
  getFID: jest.fn(cb => cb({ name: 'FID', value: 80, delta: 80, id: 'fid-1', entries: [] })),
  getFCP: jest.fn(cb => cb({ name: 'FCP', value: 800, delta: 800, id: 'fcp-1', entries: [] })),
  getLCP: jest.fn(cb => cb({ name: 'LCP', value: 1500, delta: 1500, id: 'lcp-1', entries: [] })),
  getTTFB: jest.fn(cb => cb({ name: 'TTFB', value: 300, delta: 300, id: 'ttfb-1', entries: [] }))
}));

// Mock PerformanceObserver
class MockPerformanceObserver {
  callback: PerformanceObserverCallback;
  
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }
  
  observe(): void {
    // Do nothing
  }
  
  disconnect(): void {
    // Do nothing
  }
  
  // Helper to simulate entries
  simulateEntries(entries: PerformanceEntry[]): void {
    const entryList = {
      getEntries: () => entries,
      getEntriesByType: () => entries,
      getEntriesByName: () => entries
    };
    
    this.callback(entryList, this);
  }
}

describe('Performance Monitoring', () => {
  let originalPerformanceObserver: typeof PerformanceObserver;
  let mockObserverInstance: MockPerformanceObserver;
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  
  beforeEach(() => {
    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    
    // Mock PerformanceObserver
    originalPerformanceObserver = window.PerformanceObserver;
    window.PerformanceObserver = jest.fn((callback) => {
      mockObserverInstance = new MockPerformanceObserver(callback);
      return mockObserverInstance;
    }) as unknown as typeof PerformanceObserver;
  });
  
  afterEach(() => {
    // Restore mocks
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    window.PerformanceObserver = originalPerformanceObserver;
  });
  
  test('When reportWebVitals called Then imports and calls web-vitals functions', () => {
    const mockHandler = jest.fn();
    reportWebVitals(mockHandler);
    
    // Wait for the import promise to resolve
    return Promise.resolve().then(() => {
      const webVitals = require('web-vitals');
      expect(webVitals.getCLS).toHaveBeenCalled();
      expect(webVitals.getFID).toHaveBeenCalled();
      expect(webVitals.getFCP).toHaveBeenCalled();
      expect(webVitals.getLCP).toHaveBeenCalled();
      expect(webVitals.getTTFB).toHaveBeenCalled();
      
      // Each function should have called our handler
      expect(mockHandler).toHaveBeenCalledTimes(5);
    });
  });
  
  test('When initPerformanceMonitoring called Then sets up observers', () => {
    initPerformanceMonitoring();
    
    // Should have created PerformanceObserver instances
    expect(window.PerformanceObserver).toHaveBeenCalled();
  });
  
  test('When navigation performance entry received Then logs metrics', () => {
    initPerformanceMonitoring();
    
    // Create a mock navigation entry
    const mockNavEntry = {
      entryType: 'navigation',
      startTime: 0,
      loadEventEnd: 1200,
      domContentLoadedEventEnd: 800,
      domInteractive: 600,
      transferSize: 50000
    };
    
    // Simulate navigation performance entry
    const mockObserver = window.PerformanceObserver as jest.Mock;
    const instance = mockObserver.mock.results[0].value;
    instance.callback({
      getEntries: () => [mockNavEntry]
    });
    
    // Should log navigation performance
    expect(console.log).toHaveBeenCalledWith(
      'Navigation Performance:',
      expect.objectContaining({
        pageLoadTime: '1200ms',
        domContentLoaded: '800ms',
        timeToInteractive: '600ms',
        cacheStatus: 'not-cached'
      })
    );
  });
  
  test('When resource entries received Then identifies slow resources', () => {
    initPerformanceMonitoring();
    
    // Create mock slow resource entries
    const mockSlowResource = {
      name: 'https://example.com/large-image.jpg',
      initiatorType: 'img',
      duration: 1500
    };
    
    // Simulate resource performance entries
    const mockObserver = window.PerformanceObserver as jest.Mock;
    const instance = mockObserver.mock.results[1].value;
    instance.callback({
      getEntries: () => [mockSlowResource]
    });
    
    // Should warn about slow resources
    expect(console.warn).toHaveBeenCalledWith(
      'Slow resources detected:',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'large-image.jpg',
          duration: '1500ms'
        })
      ])
    );
  });
  
  test('When checkPerformanceTarget called Then returns correct status based on LCP', () => {
    // First call reportWebVitals to populate metrics
    reportWebVitals(jest.fn());
    
    // Wait for the import promise to resolve
    return Promise.resolve().then(() => {
      // Should meet target with LCP < 2000ms
      expect(checkPerformanceTarget()).toBe(true);
      
      // Manually override LCP to test failing case
      const metrics = getCollectedMetrics();
      metrics.LCP = { name: 'LCP', value: 2500, delta: 2500, id: 'lcp-2', entries: [] };
      
      // Should not meet target with LCP > 2000ms
      expect(checkPerformanceTarget()).toBe(false);
    });
  });
  
  test('When getPerformanceRecommendations called Then returns appropriate recommendations', () => {
    // First call reportWebVitals with good metrics
    reportWebVitals(jest.fn());
    
    // Wait for the import promise to resolve
    return Promise.resolve().then(() => {
      // With good metrics, should have no recommendations
      const goodRecommendations = getPerformanceRecommendations();
      expect(goodRecommendations.length).toBe(0);
      
      // Manually override metrics to test recommendations
      const metrics = getCollectedMetrics();
      metrics.LCP = { name: 'LCP', value: 2500, delta: 2500, id: 'lcp-2', entries: [] };
      metrics.CLS = { name: 'CLS', value: 0.3, delta: 0.3, id: 'cls-2', entries: [] };
      
      // Should now have recommendations for LCP and CLS
      const badRecommendations = getPerformanceRecommendations();
      expect(badRecommendations.length).toBe(2);
      expect(badRecommendations[0]).toContain('Optimize Largest Contentful Paint');
      expect(badRecommendations[1]).toContain('Improve Cumulative Layout Shift');
    });
  });
});
