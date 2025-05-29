import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

// Simple in-memory store for performance metrics
const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS_STORED = 1000; // Prevent memory leaks

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  // Start timing when component starts rendering
  if (isFirstRender.current) {
    renderStartTime.current = performance.now();
    isFirstRender.current = false;
  }

  useEffect(() => {
    // Calculate render time when component finishes rendering
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Store metric
    const metric: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
    };

    performanceMetrics.push(metric);

    // Keep only the latest metrics to prevent memory leaks
    if (performanceMetrics.length > MAX_METRICS_STORED) {
      performanceMetrics.shift();
    }

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 100) {
      console.warn(
        `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }

    // Reset for next render
    renderStartTime.current = performance.now();
  });

  const getMetrics = useCallback(() => {
    return performanceMetrics.filter(metric => metric.componentName === componentName);
  }, [componentName]);

  const getAverageRenderTime = useCallback(() => {
    const componentMetrics = getMetrics();
    if (componentMetrics.length === 0) return 0;
    
    const totalTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / componentMetrics.length;
  }, [getMetrics]);

  const getSlowRenders = useCallback((threshold: number = 100) => {
    return getMetrics().filter(metric => metric.renderTime > threshold);
  }, [getMetrics]);

  return {
    getMetrics,
    getAverageRenderTime,
    getSlowRenders,
  };
};

// Global utility functions for performance analysis
export const getAllPerformanceMetrics = (): PerformanceMetrics[] => {
  return [...performanceMetrics];
};

export const getPerformanceReport = () => {
  const componentStats = new Map<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
  }>();

  performanceMetrics.forEach(metric => {
    const existing = componentStats.get(metric.componentName);
    if (existing) {
      existing.count++;
      existing.totalTime += metric.renderTime;
      existing.maxTime = Math.max(existing.maxTime, metric.renderTime);
      existing.minTime = Math.min(existing.minTime, metric.renderTime);
      existing.averageTime = existing.totalTime / existing.count;
    } else {
      componentStats.set(metric.componentName, {
        count: 1,
        totalTime: metric.renderTime,
        averageTime: metric.renderTime,
        maxTime: metric.renderTime,
        minTime: metric.renderTime,
      });
    }
  });

  return Object.fromEntries(componentStats);
};

export const clearPerformanceMetrics = () => {
  performanceMetrics.length = 0;
};

// Development helper to log performance report
export const logPerformanceReport = () => {
  if (process.env.NODE_ENV === 'development') {
    const report = getPerformanceReport();
    console.table(report);
  }
};

// Hook to track API call performance
export const useApiPerformanceMonitor = () => {
  const trackApiCall = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`API Call ${apiName}: ${duration.toFixed(2)}ms`);
        
        if (duration > 1000) {
          console.warn(`Slow API call detected: ${apiName} took ${duration.toFixed(2)}ms`);
        }
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.error(`API Call ${apiName} failed after ${duration.toFixed(2)}ms:`, error);
      }

      throw error;
    }
  }, []);

  return { trackApiCall };
}; 