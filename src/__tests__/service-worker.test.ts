import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Mock workbox modules
jest.mock('workbox-core', () => ({
  clientsClaim: jest.fn(),
  setCacheNameDetails: jest.fn(),
}));

jest.mock('workbox-precaching', () => ({
  precacheAndRoute: jest.fn(),
  createHandlerBoundToURL: jest.fn().mockReturnValue('handler'),
  cleanupOutdatedCaches: jest.fn(),
}));

jest.mock('workbox-routing', () => ({
  registerRoute: jest.fn(),
  NavigationRoute: jest.fn().mockImplementation(() => 'navigationRoute'),
}));

jest.mock('workbox-strategies', () => ({
  StaleWhileRevalidate: jest.fn().mockImplementation(() => ({
    name: 'StaleWhileRevalidate',
    handle: jest.fn(),
  })),
  CacheFirst: jest.fn().mockImplementation(() => ({
    name: 'CacheFirst',
    handle: jest.fn(),
  })),
}));

jest.mock('workbox-expiration', () => ({
  ExpirationPlugin: jest.fn().mockImplementation(() => ({
    name: 'ExpirationPlugin',
  })),
}));

jest.mock('workbox-cacheable-response', () => ({
  CacheableResponsePlugin: jest.fn().mockImplementation(() => ({
    name: 'CacheableResponsePlugin',
  })),
}));

// Mock self
const mockSelf = {
  addEventListener: jest.fn(),
  skipWaiting: jest.fn(),
  clients: {
    claim: jest.fn(),
  },
};

Object.defineProperty(global, 'self', {
  value: mockSelf,
  writable: true,
});

// Mock __WB_MANIFEST
Object.defineProperty(global, '__WB_MANIFEST', {
  value: [
    { url: '/index.html', revision: '123' },
    { url: '/static/js/main.js', revision: '456' },
  ],
  writable: true,
});

describe('Service Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('When service worker loads Then claims clients', () => {
    // Import the service worker script
    require('../service-worker');
    
    expect(clientsClaim).toHaveBeenCalled();
  });
  
  test('When service worker loads Then precaches manifest', () => {
    // Import the service worker script
    require('../service-worker');
    
    expect(precacheAndRoute).toHaveBeenCalledWith([
      { url: '/index.html', revision: '123' },
      { url: '/static/js/main.js', revision: '456' },
    ]);
  });
  
  test('When service worker loads Then registers navigation route', () => {
    // Import the service worker script
    require('../service-worker');
    
    expect(createHandlerBoundToURL).toHaveBeenCalledWith('/index.html');
    expect(registerRoute).toHaveBeenCalledWith('navigationRoute');
  });
  
  test('When service worker loads Then registers API route with StaleWhileRevalidate', () => {
    // Import the service worker script
    require('../service-worker');
    
    // Find the API route registration call
    const apiRouteCall = (registerRoute as jest.Mock).mock.calls.find(
      call => call[0].toString().includes('/api/')
    );
    
    expect(apiRouteCall).toBeDefined();
    expect(StaleWhileRevalidate).toHaveBeenCalled();
  });
  
  test('When service worker loads Then registers image route with CacheFirst', () => {
    // Import the service worker script
    require('../service-worker');
    
    // Find the image route registration call
    const imageRouteCall = (registerRoute as jest.Mock).mock.calls.find(
      call => call[0].toString().includes('image')
    );
    
    expect(imageRouteCall).toBeDefined();
    expect(CacheFirst).toHaveBeenCalled();
    expect(ExpirationPlugin).toHaveBeenCalledWith(expect.objectContaining({
      maxEntries: expect.any(Number),
      maxAgeSeconds: expect.any(Number),
    }));
  });
  
  test('When service worker loads Then registers static assets route', () => {
    // Import the service worker script
    require('../service-worker');
    
    // Find the static assets route registration call
    const staticRouteCall = (registerRoute as jest.Mock).mock.calls.find(
      call => call[0].toString().includes('style') || call[0].toString().includes('script')
    );
    
    expect(staticRouteCall).toBeDefined();
    expect(StaleWhileRevalidate).toHaveBeenCalled();
    expect(CacheableResponsePlugin).toHaveBeenCalledWith(expect.objectContaining({
      statuses: expect.arrayContaining([0, 200]),
    }));
  });
  
  test('When service worker receives message Then handles SKIP_WAITING', () => {
    // Import the service worker script
    require('../service-worker');
    
    // Find the message event listener
    const messageListener = mockSelf.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    );
    
    expect(messageListener).toBeDefined();
    
    // Simulate a SKIP_WAITING message
    const handler = messageListener[1];
    handler({ data: { type: 'SKIP_WAITING' } });
    
    expect(mockSelf.skipWaiting).toHaveBeenCalled();
  });
});
