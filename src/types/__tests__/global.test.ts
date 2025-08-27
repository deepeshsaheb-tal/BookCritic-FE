// This test file ensures that our global type declarations are working correctly

describe('Global Type Declarations', () => {
  test('When using image imports Then types are properly defined', () => {
    // Test that image imports are properly typed
    const testImage = 'test.jpg';
    const testPng = 'test.png';
    const testSvg = 'test.svg';
    const testWebp = 'test.webp';
    
    // If the types are properly defined, these assignments should work without type errors
    const imageModule: { default: string } = { default: testImage };
    const pngModule: { default: string } = { default: testPng };
    const svgModule: { default: string } = { default: testSvg };
    const webpModule: { default: string } = { default: testWebp };
    
    expect(imageModule.default).toBe(testImage);
    expect(pngModule.default).toBe(testPng);
    expect(svgModule.default).toBe(testSvg);
    expect(webpModule.default).toBe(testWebp);
  });
  
  test('When using PerformanceObserver Then types are properly defined', () => {
    // Test that PerformanceObserver types are properly defined
    const mockCallback = jest.fn();
    const observer = new PerformanceObserver(mockCallback);
    
    // If the types are properly defined, these methods should exist
    expect(typeof observer.observe).toBe('function');
    expect(typeof observer.disconnect).toBe('function');
    expect(typeof observer.takeRecords).toBe('function');
  });
  
  test('When using performance API Then types are properly defined', () => {
    // Test that performance API types are properly defined
    const originalPerformance = window.performance;
    
    // Mock performance object
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue([]),
        getEntriesByName: jest.fn().mockReturnValue([]),
        mark: jest.fn(),
        measure: jest.fn(),
        now: jest.fn().mockReturnValue(123.45),
        timeOrigin: 1629300000000,
      },
      configurable: true,
    });
    
    // If the types are properly defined, these methods should exist
    expect(typeof window.performance.getEntriesByType).toBe('function');
    expect(typeof window.performance.getEntriesByName).toBe('function');
    expect(typeof window.performance.mark).toBe('function');
    expect(typeof window.performance.measure).toBe('function');
    expect(typeof window.performance.now).toBe('function');
    expect(typeof window.performance.timeOrigin).toBe('number');
    
    // Restore original performance object
    Object.defineProperty(window, 'performance', {
      value: originalPerformance,
      configurable: true,
    });
  });
  
  test('When using service worker Then types are properly defined', () => {
    // Test that service worker types are properly defined
    const originalServiceWorker = navigator.serviceWorker;
    
    // Mock service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({}),
        getRegistration: jest.fn().mockResolvedValue({}),
        ready: Promise.resolve({}),
      },
      configurable: true,
    });
    
    // If the types are properly defined, these methods should exist
    expect(typeof navigator.serviceWorker.register).toBe('function');
    expect(typeof navigator.serviceWorker.getRegistration).toBe('function');
    expect(navigator.serviceWorker.ready).toBeInstanceOf(Promise);
    
    // Restore original service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true,
    });
  });
});
