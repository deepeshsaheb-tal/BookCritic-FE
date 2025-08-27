import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LazyLoad } from '../lazy-load';

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = options?.threshold ? 
      Array.isArray(options.threshold) ? options.threshold : [options.threshold] : 
      [0];
    this.elements = new Set();
  }
  
  observe(element: Element): void {
    this.elements.add(element);
  }
  
  unobserve(element: Element): void {
    this.elements.delete(element);
  }
  
  disconnect(): void {
    this.elements.clear();
  }
  
  // Helper to simulate intersection
  triggerIntersection(isIntersecting: boolean): void {
    const entries: IntersectionObserverEntry[] = Array.from(this.elements).map(element => ({
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1.0 : 0.0,
      intersectionRect: isIntersecting ? element.getBoundingClientRect() : new DOMRect(),
      isIntersecting,
      rootBounds: this.root ? this.root.getBoundingClientRect() : null,
      target: element,
      time: Date.now()
    }));
    
    this.callback(entries, this);
  }
}

describe('LazyLoad', () => {
  let originalIntersectionObserver: typeof IntersectionObserver;
  let mockIntersectionObserver: MockIntersectionObserver;
  
  beforeEach(() => {
    originalIntersectionObserver = window.IntersectionObserver;
    
    // Replace with mock
    window.IntersectionObserver = jest.fn((callback, options) => {
      mockIntersectionObserver = new MockIntersectionObserver(callback, options);
      return mockIntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
  });
  
  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });
  
  test('When not in viewport Then renders placeholder', () => {
    render(
      <LazyLoad placeholder={<div data-testid="placeholder">Loading...</div>}>
        <div data-testid="content">Actual Content</div>
      </LazyLoad>
    );
    
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
  
  test('When enters viewport Then renders children', () => {
    render(
      <LazyLoad placeholder={<div data-testid="placeholder">Loading...</div>}>
        <div data-testid="content">Actual Content</div>
      </LazyLoad>
    );
    
    // Initially shows placeholder
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    
    // Simulate intersection
    act(() => {
      mockIntersectionObserver.triggerIntersection(true);
    });
    
    // Now shows content
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
  });
  
  test('When keepMounted is false Then hides content when leaving viewport', () => {
    render(
      <LazyLoad 
        placeholder={<div data-testid="placeholder">Loading...</div>}
        keepMounted={false}
      >
        <div data-testid="content">Actual Content</div>
      </LazyLoad>
    );
    
    // Simulate entering viewport
    act(() => {
      mockIntersectionObserver.triggerIntersection(true);
    });
    
    // Content is visible
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    // Simulate leaving viewport
    act(() => {
      mockIntersectionObserver.triggerIntersection(false);
    });
    
    // Content is hidden, placeholder is back
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });
  
  test('When keepMounted is true Then keeps content when leaving viewport', () => {
    render(
      <LazyLoad 
        placeholder={<div data-testid="placeholder">Loading...</div>}
        keepMounted={true}
      >
        <div data-testid="content">Actual Content</div>
      </LazyLoad>
    );
    
    // Simulate entering viewport
    act(() => {
      mockIntersectionObserver.triggerIntersection(true);
    });
    
    // Content is visible
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    // Simulate leaving viewport
    act(() => {
      mockIntersectionObserver.triggerIntersection(false);
    });
    
    // Content remains visible
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
  });
  
  test('When onVisible callback provided Then calls it when entering viewport', () => {
    const onVisibleMock = jest.fn();
    
    render(
      <LazyLoad onVisible={onVisibleMock}>
        <div>Content</div>
      </LazyLoad>
    );
    
    // Callback not called initially
    expect(onVisibleMock).not.toHaveBeenCalled();
    
    // Simulate entering viewport
    act(() => {
      mockIntersectionObserver.triggerIntersection(true);
    });
    
    // Callback should be called
    expect(onVisibleMock).toHaveBeenCalledTimes(1);
  });
  
  test('When className provided Then applies it to container', () => {
    render(
      <LazyLoad className="custom-class">
        <div>Content</div>
      </LazyLoad>
    );
    
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
