/**
 * Performance Fixes Validation Script
 * Run with: node test-performance-fixes.js
 * 
 * This script validates that all performance fixes are working correctly.
 */

const http = require('http');

console.log('🧪 Testing Performance Fixes...\n');

// Test 1: Backend - Cache Headers for Static Assets
console.log('1️⃣  Testing Static Asset Cache Headers...');
http.get('http://127.0.0.1:8000/storage/media/images/img-0b4a5678-7e0d-4df3-9312-88784213548f.webp', (res) => {
  const cacheControl = res.headers['cache-control'];
  const etag = res.headers['etag'];
  const expires = res.headers['expires'];
  
  console.log('   Cache-Control:', cacheControl || '❌ MISSING');
  console.log('   ETag:', etag || '❌ MISSING');
  console.log('   Expires:', expires || '❌ MISSING');
  
  if (cacheControl && cacheControl.includes('max-age=31536000')) {
    console.log('   ✅ Cache headers are correct!\n');
  } else {
    console.log('   ⚠️  Cache headers might not be configured correctly\n');
  }
}).on('error', (err) => {
  console.log('   ❌ Error:', err.message);
  console.log('   Make sure Laravel server is running on port 8000\n');
});

// Test 2: Backend - Filter Options API
console.log('2️⃣  Testing Filter Options API...');
const start = Date.now();
http.get('http://127.0.0.1:8000/api/v1/san-pham/filters/options', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const duration = Date.now() - start;
    console.log(`   Response time: ${duration}ms`);
    
    if (duration < 500) {
      console.log('   ✅ API is fast (cached)!\n');
    } else if (duration < 2000) {
      console.log('   ⚠️  API is slower than expected, but acceptable\n');
    } else {
      console.log('   ❌ API is too slow! Expected < 500ms\n');
    }
    
    try {
      const json = JSON.parse(data);
      if (json.data) {
        console.log('   ✅ Response structure is correct\n');
      }
    } catch (e) {
      console.log('   ❌ Invalid JSON response\n');
    }
  });
}).on('error', (err) => {
  console.log('   ❌ Error:', err.message);
  console.log('   Make sure Laravel server is running on port 8000\n');
});

// Test 3: Frontend - Check if React Query is installed
console.log('3️⃣  Checking React Query installation...');
try {
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  if (packageJson.dependencies['@tanstack/react-query']) {
    console.log('   ✅ React Query is installed:', packageJson.dependencies['@tanstack/react-query']);
  } else {
    console.log('   ❌ React Query is NOT installed');
  }
  
  if (packageJson.dependencies['use-debounce']) {
    console.log('   ✅ use-debounce is installed:', packageJson.dependencies['use-debounce']);
  } else {
    console.log('   ❌ use-debounce is NOT installed');
  }
  
  // Check if QueryProvider exists
  if (fs.existsSync('./lib/query-client.tsx')) {
    console.log('   ✅ QueryProvider file exists');
  } else {
    console.log('   ❌ QueryProvider file NOT found');
  }
  
  console.log('');
} catch (e) {
  console.log('   ❌ Error reading package.json:', e.message, '\n');
}

// Test 4: Frontend - Check infinite scroll fix
console.log('4️⃣  Checking infinite scroll rootMargin fix...');
try {
  const fs = require('fs');
  const productListContent = fs.readFileSync('./components/filter/product-list.tsx', 'utf8');
  
  if (productListContent.includes('rootMargin: "100px 0px"')) {
    console.log('   ✅ Infinite scroll rootMargin is fixed (100px)');
  } else if (productListContent.includes('rootMargin: "600px 0px"')) {
    console.log('   ❌ Infinite scroll rootMargin is still 600px');
  } else {
    console.log('   ⚠️  Could not verify rootMargin value');
  }
  console.log('');
} catch (e) {
  console.log('   ❌ Error reading product-list.tsx:', e.message, '\n');
}

// Summary
setTimeout(() => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ = Test passed');
  console.log('⚠️  = Test passed with warnings');
  console.log('❌ = Test failed\n');
  console.log('Next steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Navigate to http://localhost:3000/filter');
  console.log('3. Open DevTools Network tab');
  console.log('4. Verify improvements:\n');
  console.log('   - Static assets show "304 Not Modified" on refresh');
  console.log('   - Filter options API responds < 500ms');
  console.log('   - Page 2 loads only when scrolling near bottom');
  console.log('   - Search doesn\'t trigger on every keystroke\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}, 2000);
