module.exports = {
  ci: {
    build: {
      command: 'npm run build',
      outputDir: './dist',
    },
    upload: {
      target: 'temporary-public-storage',
    },

    collect: {
      url: ['http://localhost:8080'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['off'], // Skipped for early development
        'categories:pwa': ['off'],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        
        // Resource budgets
        'resource-summary:document:size': ['warn', { maxNumericValue: 14000 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 60000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 200000 }],
        'resource-summary:font:size': ['warn', { maxNumericValue: 100000 }],
        
        // Performance best practices
        'unused-javascript': ['warn', { maxNumericValue: 20000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 100 }],
        'uses-optimized-images': ['warn', {}],
        // 'uses-webp-images': ['off'], // Skipped for early development
        'uses-responsive-images': ['warn', {}],
        'efficient-animated-content': ['warn', {}],
        // 'preload-lcp-image': ['off'], // Skipped for early development
        'uses-rel-preconnect': ['warn', {}],
      },
    },
  },
}; 