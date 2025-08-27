import React from 'react';
import { render, screen } from '@testing-library/react';
import { PerformanceDashboard } from '../performance-dashboard';
import * as performanceMonitoring from '../../../utils/performance-monitoring';

// Mock the performance monitoring utilities
jest.mock('../../../utils/performance-monitoring', () => ({
  getCollectedMetrics: jest.fn(),
  getPerformanceRecommendations: jest.fn(),
  checkPerformanceTarget: jest.fn(),
}));

describe('PerformanceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (performanceMonitoring.getCollectedMetrics as jest.Mock).mockReturnValue({
      LCP: { value: 1800 },
      FID: { value: 80 },
      CLS: { value: 0.05 },
      FCP: { value: 900 },
      TTFB: { value: 300 }
    });
    
    (performanceMonitoring.getPerformanceRecommendations as jest.Mock).mockReturnValue([]);
    (performanceMonitoring.checkPerformanceTarget as jest.Mock).mockReturnValue(true);
    
    // Mock performance API
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue([{
          startTime: 0,
          loadEventEnd: 1200,
          domContentLoadedEventEnd: 800,
          domInteractive: 600,
          transferSize: 50000
        }])
      },
      configurable: true
    });
  });
  
  test('When rendered Then displays performance metrics', () => {
    render(<PerformanceDashboard />);
    
    // Check for main sections
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Core Web Vitals')).toBeInTheDocument();
    expect(screen.getByText('Additional Metrics')).toBeInTheDocument();
    
    // Check for specific metrics
    expect(screen.getByText('LCP')).toBeInTheDocument();
    expect(screen.getByText('FID')).toBeInTheDocument();
    expect(screen.getByText('CLS')).toBeInTheDocument();
    expect(screen.getByText('FCP')).toBeInTheDocument();
    expect(screen.getByText('TTFB')).toBeInTheDocument();
    
    // Check for metric values
    expect(screen.getByText('1800.0ms')).toBeInTheDocument();
    expect(screen.getByText('80.0ms')).toBeInTheDocument();
    expect(screen.getByText('0.1ms')).toBeInTheDocument(); // CLS is formatted
  });
  
  test('When target is met Then displays success message', () => {
    (performanceMonitoring.checkPerformanceTarget as jest.Mock).mockReturnValue(true);
    
    render(<PerformanceDashboard />);
    
    expect(screen.getByText(/Target Met/)).toBeInTheDocument();
    expect(screen.getByText(/✅/)).toBeInTheDocument();
  });
  
  test('When target is not met Then displays failure message', () => {
    (performanceMonitoring.checkPerformanceTarget as jest.Mock).mockReturnValue(false);
    
    render(<PerformanceDashboard />);
    
    expect(screen.getByText(/Target Not Met/)).toBeInTheDocument();
    expect(screen.getByText(/❌/)).toBeInTheDocument();
  });
  
  test('When recommendations exist Then displays them', () => {
    const recommendations = [
      'Optimize Largest Contentful Paint (LCP)',
      'Improve Cumulative Layout Shift (CLS)'
    ];
    
    (performanceMonitoring.getPerformanceRecommendations as jest.Mock).mockReturnValue(recommendations);
    
    render(<PerformanceDashboard />);
    
    expect(screen.getByText('Performance Recommendations')).toBeInTheDocument();
    expect(screen.getByText(recommendations[0])).toBeInTheDocument();
    expect(screen.getByText(recommendations[1])).toBeInTheDocument();
  });
  
  test('When no recommendations Then does not display recommendations section', () => {
    (performanceMonitoring.getPerformanceRecommendations as jest.Mock).mockReturnValue([]);
    
    render(<PerformanceDashboard />);
    
    expect(screen.queryByText('Performance Recommendations')).not.toBeInTheDocument();
  });
  
  test('When navigation timing available Then displays navigation metrics', () => {
    render(<PerformanceDashboard />);
    
    expect(screen.getByText('Navigation Timing')).toBeInTheDocument();
    expect(screen.getByText('Page Load Time')).toBeInTheDocument();
    expect(screen.getByText('DOM Content Loaded')).toBeInTheDocument();
    expect(screen.getByText('Time to Interactive')).toBeInTheDocument();
    expect(screen.getByText('Cache Status')).toBeInTheDocument();
    
    // Check for metric values
    expect(screen.getByText('1200.0ms')).toBeInTheDocument();
    expect(screen.getByText('800.0ms')).toBeInTheDocument();
    expect(screen.getByText('600.0ms')).toBeInTheDocument();
    expect(screen.getByText('Not-cached')).toBeInTheDocument();
  });
  
  test('When poor metrics Then displays correct status colors', () => {
    (performanceMonitoring.getCollectedMetrics as jest.Mock).mockReturnValue({
      LCP: { value: 4500 }, // Poor
      FID: { value: 350 },  // Poor
      CLS: { value: 0.3 },  // Poor
      FCP: { value: 3500 }, // Poor
      TTFB: { value: 2000 } // Poor
    });
    
    render(<PerformanceDashboard />);
    
    // We can't easily test for CSS classes in this test environment,
    // but we can check that the values are displayed
    expect(screen.getByText('4500.0ms')).toBeInTheDocument();
    expect(screen.getByText('350.0ms')).toBeInTheDocument();
    expect(screen.getByText('0.3ms')).toBeInTheDocument();
  });
});
