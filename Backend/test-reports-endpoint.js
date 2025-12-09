const http = require('http');

// Test reports endpoint
http.get('http://localhost:5000/api/reports', {
  headers: {
    'Authorization': 'Bearer invalid_token'
  }
}, (res) => {
  console.log(`Reports endpoint status code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 500) {
      console.error('❌ Still getting 500 error');
      process.exit(1);
    } else {
      console.log('✅ Reports endpoint working (no 500 error)');
      process.exit(0);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('Test timeout');
  process.exit(1);
}, 5000);
