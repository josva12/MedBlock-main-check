/**
 * Artillery processor for CAPTCHA performance tests
 */

const fs = require('fs');
const path = require('path');

// Store response times for analysis
const responseTimes = [];

/**
 * Record response time for analysis
 */
function recordResponseTime(requestParams, context, ee, next) {
  const responseTime = context.vars.responseTime || 0;
  responseTimes.push({
    timestamp: Date.now(),
    responseTime: responseTime,
    url: requestParams.url,
    method: requestParams.method
  });
  
  // Log response time
  console.log(`Response time: ${responseTime}ms for ${requestParams.method} ${requestParams.url}`);
  
  return next();
}

/**
 * Generate random CAPTCHA input for testing
 */
function generateRandomCaptchaInput(requestParams, context, ee, next) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  context.vars.randomCaptchaInput = result;
  return next();
}

/**
 * Simulate realistic user behavior
 */
function simulateUserBehavior(requestParams, context, ee, next) {
  // Random think time between 1-5 seconds
  const thinkTime = Math.floor(Math.random() * 4000) + 1000;
  context.vars.thinkTime = thinkTime;
  
  // Random user agent
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  ];
  
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  context.vars.userAgent = randomUserAgent;
  
  return next();
}

/**
 * Save performance metrics to file
 */
function savePerformanceMetrics(requestParams, context, ee, next) {
  const metrics = {
    timestamp: Date.now(),
    totalRequests: responseTimes.length,
    avgResponseTime: responseTimes.reduce((a, b) => a + b.responseTime, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes.map(r => r.responseTime)),
    maxResponseTime: Math.max(...responseTimes.map(r => r.responseTime)),
    responseTimes: responseTimes.slice(-100) // Keep last 100 for analysis
  };
  
  const metricsPath = path.join(__dirname, 'performance-metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  
  return next();
}

/**
 * Validate CAPTCHA response
 */
function validateCaptchaResponse(requestParams, context, ee, next) {
  const response = context.vars.response;
  
  if (response && response.statusCode === 200) {
    console.log('✅ CAPTCHA request successful');
  } else if (response && response.statusCode === 429) {
    console.log('⚠️ Rate limit hit - expected behavior');
  } else {
    console.log(`❌ CAPTCHA request failed: ${response ? response.statusCode : 'No response'}`);
  }
  
  return next();
}

/**
 * Generate random IP for load testing
 */
function generateRandomIP(requestParams, context, ee, next) {
  const ipRanges = [
    '192.168.1.',
    '10.0.0.',
    '172.16.0.',
    '203.0.113.'
  ];
  
  const randomRange = ipRanges[Math.floor(Math.random() * ipRanges.length)];
  const randomOctet = Math.floor(Math.random() * 254) + 1;
  const randomIP = randomRange + randomOctet;
  
  context.vars.randomIP = randomIP;
  return next();
}

/**
 * Simulate bot behavior
 */
function simulateBotBehavior(requestParams, context, ee, next) {
  // Bots typically have faster response times and no think time
  context.vars.thinkTime = Math.floor(Math.random() * 100); // 0-100ms
  
  // Bot user agents
  const botUserAgents = [
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    'curl/7.68.0'
  ];
  
  const randomBotAgent = botUserAgents[Math.floor(Math.random() * botUserAgents.length)];
  context.vars.userAgent = randomBotAgent;
  
  return next();
}

/**
 * Clean up after test completion
 */
function cleanup(requestParams, context, ee, next) {
  // Save final metrics
  savePerformanceMetrics(requestParams, context, ee, () => {});
  
  console.log('🧹 Performance test cleanup completed');
  return next();
}

module.exports = {
  recordResponseTime,
  generateRandomCaptchaInput,
  simulateUserBehavior,
  savePerformanceMetrics,
  validateCaptchaResponse,
  generateRandomIP,
  simulateBotBehavior,
  cleanup
}; 