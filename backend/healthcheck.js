const http = require('http');
const config = require('./config');

const options = {
  host: 'localhost',
  port: config.server.port,
  path: '/api/health',
  timeout: 5000,
};

const request = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const healthData = JSON.parse(data);
      console.log(`Health check status: ${res.statusCode} - ${healthData.status}`);
      
      if (res.statusCode === 200 && healthData.status === 'OK') {
        console.log('✅ Health check passed');
        process.exit(0);
      } else {
        console.log('⚠️  Health check degraded');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Health check failed - Invalid response format');
      process.exit(1);
    }
  });
});

request.on('error', (err) => {
  console.log('❌ Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('⏰ Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
