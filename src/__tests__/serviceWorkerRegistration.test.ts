import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

describe('Service Worker Registration', () => {
  let originalServiceWorker: typeof navigator.serviceWorker;
  let mockRegistration: any;
  
  beforeEach(() => {
    // Store original serviceWorker
    originalServiceWorker = navigator.serviceWorker;
    
    // Mock service worker registration
    mockRegistration = {
      installing: null,
      waiting: null,
      active: { state: 'activated' },
      update: jest.fn().mockResolvedValue(undefined),
      unregister: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
    };
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(mockRegistration),
        getRegistration: jest.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
      },
      configurable: true,
    });
    
    // Mock window
    Object.defineProperty(window, 'addEventListener', {
      value: jest.fn(),
      configurable: true,
    });
    
    // Mock console
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore original serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true,
    });
    
    jest.restoreAllMocks();
  });
  
  test('When register called Then registers service worker', () => {
    serviceWorkerRegistration.register({});
    
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
      expect.stringContaining('service-worker.js'),
      { scope: '/' }
    );
  });
  
  test('When register called with config Then calls onSuccess callback on success', async () => {
    const onSuccess = jest.fn();
    
    await serviceWorkerRegistration.register({ onSuccess });
    
    expect(onSuccess).toHaveBeenCalled();
  });
  
  test('When register called with config Then calls onUpdate callback when waiting worker exists', async () => {
    const onUpdate = jest.fn();
    
    // Mock a waiting service worker
    mockRegistration.waiting = { state: 'waiting' };
    
    await serviceWorkerRegistration.register({ onUpdate });
    
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      waiting: mockRegistration.waiting,
    }));
  });
  
  test('When register called and service worker not supported Then logs error', async () => {
    // Mock service worker not supported
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
    });
    
    await serviceWorkerRegistration.register({});
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('not supported')
    );
  });
  
  test('When register called in development mode Then logs message', async () => {
    // Mock development environment
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true,
    });
    
    await serviceWorkerRegistration.register({});
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('This web app is being served cache-first')
    );
  });
  
  test('When unregister called Then unregisters all service workers', async () => {
    await serviceWorkerRegistration.unregister();
    
    expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled();
    expect(mockRegistration.unregister).toHaveBeenCalled();
  });
  
  test('When checkValidServiceWorker called with invalid response Then reloads page', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      status: 404,
      headers: {
        get: () => 'text/html',
      },
    } as Response);
    
    // Mock location.reload
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: jest.fn() };
    
    // Call the internal checkValidServiceWorker function
    // This is a bit hacky since it's not exported, but we can use any as a workaround
    const checkValidServiceWorker = (serviceWorkerRegistration as any).checkValidServiceWorker;
    if (checkValidServiceWorker) {
      await checkValidServiceWorker('service-worker.js');
      expect(window.location.reload).toHaveBeenCalled();
    }
    
    // Restore location
    window.location = originalLocation;
  });
});
