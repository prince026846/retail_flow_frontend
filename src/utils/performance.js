// Performance monitoring utilities for code splitting and lazy loading
import React from 'react';

export const performanceMonitor = {
  // Track when chunks are loaded
  trackChunkLoad: (chunkName) => {
    if (window.performance && window.performance.mark) {
      const markName = `chunk-${chunkName}-loaded`;
      window.performance.mark(markName);
      console.log(`📦 Chunk loaded: ${chunkName}`);
    }
  },

  // Measure time between marks with performance warnings
  measureChunkLoadTime: (chunkName, startMark) => {
    if (window.performance && window.performance.measure) {
      const measureName = `chunk-${chunkName}-load-time`;
      try {
        window.performance.measure(measureName, startMark, `chunk-${chunkName}-loaded`);
        const measures = window.performance.getEntriesByName(measureName);
        if (measures.length > 0) {
          const duration = measures[0].duration;
          console.log(`⏱️ ${chunkName} loaded in ${duration.toFixed(2)}ms`);
          
          // Performance warnings
          if (duration > 100) {
            console.warn(`🐌 Slow chunk loading detected: ${chunkName} took ${duration.toFixed(2)}ms (target: <100ms)`);
          } else if (duration > 50) {
            console.warn(`⚠️ Moderate chunk loading: ${chunkName} took ${duration.toFixed(2)}ms (target: <50ms)`);
          } else {
            console.log(`✅ Fast chunk loading: ${chunkName} took ${duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        console.warn(`Could not measure load time for ${chunkName}:`, error);
      }
    }
  },

  // Log resource timing information with performance analysis
  logResourceTiming: () => {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && !resource.name.includes('node_modules')
      );
      
      console.group('🚀 JavaScript Resource Loading Analysis');
      let totalLoadTime = 0;
      let slowResources = [];
      
      jsResources.forEach(resource => {
        const duration = resource.duration;
        const fileName = resource.name.split('/').pop();
        totalLoadTime += duration;
        
        console.log(`${fileName}: ${duration.toFixed(2)}ms`);
        
        if (duration > 100) {
          slowResources.push({ name: fileName, duration });
        }
      });
      
      console.log(`📊 Total JS load time: ${totalLoadTime.toFixed(2)}ms`);
      console.log(`📈 Average per file: ${(totalLoadTime / jsResources.length).toFixed(2)}ms`);
      
      if (slowResources.length > 0) {
        console.warn('🐌 Slow resources detected:', slowResources);
      }
      
      console.groupEnd();
    }
  },

  // Monitor lazy loading performance with timeout handling
  monitorLazyLoad: async (importFunction, chunkName, timeoutMs = 10000) => {
    const startMark = `chunk-${chunkName}-start`;
    if (window.performance && window.performance.mark) {
      window.performance.mark(startMark);
    }

    try {
      // In development, increase timeout to avoid false failures
      const actualTimeout = import.meta.env.DEV ? 10000 : timeoutMs;
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Chunk ${chunkName} loading timeout after ${actualTimeout}ms`)), actualTimeout);
      });

      const module = await Promise.race([
        importFunction(),
        timeoutPromise
      ]);
      
      performanceMonitor.trackChunkLoad(chunkName);
      performanceMonitor.measureChunkLoadTime(chunkName, startMark);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load chunk ${chunkName}:`, error);
      
      // Track failed load attempt
      if (window.performance && window.performance.mark) {
        const failMark = `chunk-${chunkName}-failed`;
        window.performance.mark(failMark);
      }
      
      // In development, provide more helpful error message
      if (import.meta.env.DEV) {
        console.warn(`💡 Development tip: Chunk loading may be slow due to dev server. Try refreshing or check network.`);
      }
      
      throw error;
    }
  },

  // Preload critical chunks
  preloadChunk: (chunkPath) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = chunkPath;
    document.head.appendChild(link);
  },

  // Get performance metrics
  getMetrics: () => {
    if (!window.performance) return null;
    
    const navigation = window.performance.getEntriesByType('navigation')[0];
    const resources = window.performance.getEntriesByType('resource');
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalResources: resources.length,
      slowResources: resources.filter(r => r.duration > 100).length
    };
  }
};

// Enhanced lazy loading wrapper with performance tracking and error boundaries
export const lazyWithTracking = (importFunction, chunkName) => {
  return React.lazy(() => 
    performanceMonitor.monitorLazyLoad(importFunction, chunkName)
      .catch(error => {
        console.error(`Failed to load ${chunkName}:`, error);
        // Return a fallback component or retry logic
        return importFunction(); // Retry once
      })
  );
};

// Preload critical chunks for better performance
export const preloadCriticalChunks = () => {
  // Disable preloading in development as it causes 404 errors
  if (import.meta.env.DEV) {
    console.log('🚫 Preloading disabled in development mode');
    return;
  }
  
  // In production, these would be the actual chunk names from build
  const criticalChunks = [
    // These will be dynamically determined based on actual build output
  ];
  
  criticalChunks.forEach(chunk => {
    performanceMonitor.preloadChunk(chunk);
  });
};

// Initialize performance monitoring with optimizations
if (typeof window !== 'undefined') {
  // Log resource timing after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logResourceTiming();
      
      // Log overall performance metrics
      const metrics = performanceMonitor.getMetrics();
      if (metrics) {
        console.log('📊 Page Performance Metrics:', metrics);
        
        if (metrics.domContentLoaded > 1000) {
          console.warn('🐌 Slow DOM content loading detected');
        }
        
        if (metrics.loadComplete > 2000) {
          console.warn('🐌 Slow page load detected');
        }
      }
    }, 1000);
  });

  // Preload critical chunks
  setTimeout(preloadCriticalChunks, 2000);
}
