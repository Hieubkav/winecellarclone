import { chromium } from '@playwright/test';

interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  resourceType: string;
}

async function analyzePerformance() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const networkRequests: NetworkRequest[] = [];
  const startTime = Date.now();

  page.on('request', (request) => {
    console.log(`→ ${request.method()} ${request.url()}`);
  });

  page.on('response', async (response) => {
    const request = response.request();
    const timing = response.request().timing();
    const duration = timing ? timing.responseEnd : 0;

    try {
      const headers = await response.allHeaders();
      const contentLength = headers['content-length'] || '0';

      networkRequests.push({
        url: request.url(),
        method: request.method(),
        duration: duration,
        size: parseInt(contentLength),
        status: response.status(),
        resourceType: request.resourceType(),
      });

      console.log(`← ${response.status()} ${request.url()} (${duration.toFixed(2)}ms, ${(parseInt(contentLength) / 1024).toFixed(2)}KB)`);
    } catch (error) {
      console.error(`Error processing response for ${request.url()}: ${error}`);
    }
  });

  console.log('\n🚀 Starting performance analysis for http://localhost:3000/filter\n');

  try {
    await page.goto('http://localhost:3000/filter', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('\nWaiting 5 seconds for additional resources to load...\n');
    await page.waitForTimeout(5000);

    const loadTime = Date.now() - startTime;
    console.log(`\n⏱️  Total page load time: ${loadTime}ms (${(loadTime / 1000).toFixed(2)}s)\n`);

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    console.log('📊 Performance Metrics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`DNS Lookup:              ${performanceMetrics.dns.toFixed(2)}ms`);
    console.log(`TCP Connection:          ${performanceMetrics.tcp.toFixed(2)}ms`);
    console.log(`Time to First Byte:      ${performanceMetrics.ttfb.toFixed(2)}ms`);
    console.log(`Download:                ${performanceMetrics.download.toFixed(2)}ms`);
    console.log(`DOM Interactive:         ${performanceMetrics.domInteractive.toFixed(2)}ms`);
    console.log(`DOM Complete:            ${performanceMetrics.domComplete.toFixed(2)}ms`);
    console.log(`Load Complete:           ${performanceMetrics.loadComplete.toFixed(2)}ms`);
    console.log(`First Paint:             ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`First Contentful Paint:  ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);

    const sortedByDuration = [...networkRequests]
      .filter(req => req.duration > 0)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    console.log('\n🐌 Top 10 Slowest Requests:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sortedByDuration.forEach((req, index) => {
      const urlShort = req.url.length > 80 ? req.url.substring(0, 77) + '...' : req.url;
      console.log(`${index + 1}. ${urlShort}`);
      console.log(`   Duration: ${req.duration.toFixed(2)}ms | Size: ${(req.size / 1024).toFixed(2)}KB | Status: ${req.status} | Type: ${req.resourceType}`);
    });

    const sortedBySize = [...networkRequests]
      .filter(req => req.size > 0)
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    console.log('\n📦 Top 10 Largest Requests:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sortedBySize.forEach((req, index) => {
      const urlShort = req.url.length > 80 ? req.url.substring(0, 77) + '...' : req.url;
      console.log(`${index + 1}. ${urlShort}`);
      console.log(`   Size: ${(req.size / 1024).toFixed(2)}KB | Duration: ${req.duration.toFixed(2)}ms | Status: ${req.status} | Type: ${req.resourceType}`);
    });

    const apiRequests = networkRequests.filter(req => 
      req.url.includes('/api/') || req.url.includes('localhost:8000')
    );

    if (apiRequests.length > 0) {
      console.log('\n🔌 API Requests:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      apiRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.method} ${req.url}`);
        console.log(`   Duration: ${req.duration.toFixed(2)}ms | Size: ${(req.size / 1024).toFixed(2)}KB | Status: ${req.status}`);
      });
    }

    const totalSize = networkRequests.reduce((sum, req) => sum + req.size, 0);
    const totalRequests = networkRequests.length;

    console.log('\n📈 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Requests:          ${totalRequests}`);
    console.log(`Total Downloaded:        ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Average Request Time:    ${(networkRequests.reduce((sum, req) => sum + req.duration, 0) / totalRequests).toFixed(2)}ms`);

    console.log('\n💡 Recommendations:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (performanceMetrics.ttfb > 200) {
      console.log('⚠️  High TTFB detected. Consider optimizing server response time.');
    }
    
    if (sortedByDuration[0]?.duration > 1000) {
      console.log('⚠️  Some requests are taking over 1 second. Consider caching or optimization.');
    }
    
    if (totalSize > 5 * 1024 * 1024) {
      console.log('⚠️  Total page size is over 5MB. Consider lazy loading or image optimization.');
    }
    
    if (apiRequests.some(req => req.duration > 500)) {
      console.log('⚠️  Slow API requests detected. Consider backend optimization or caching.');
    }

    console.log('\n✅ Analysis complete! Browser will remain open for 30 seconds for manual inspection.');
    console.log('   Or press Ctrl+C to exit now.\n');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

analyzePerformance();
