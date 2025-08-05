const logger = require('../utils/logger');

// In-memory metrics storage (in production, use Redis or database)
const metrics = {
  captchaGenerated: 0,
  captchaValidated: 0,
  captchaFailed: 0,
  failedAttempts: 0,
  lockouts: 0,
  rateLimitExceeded: 0,
  ipAttempts: new Map(), // Track attempts per IP
  hourlyStats: new Map(), // Track hourly statistics
  dailyStats: new Map(), // Track daily statistics
  
  // Enhanced granular metrics
  validationAttempts: 0,
  sessionExpirations: 0,
  inputSanitizations: 0,
  securityEvents: new Map(), // Track different types of security events
  userAgents: new Map(), // Track user agent patterns
  geographicData: new Map(), // Track geographic patterns (if available)
  responseTimes: [], // Track CAPTCHA response times
  difficultyLevels: new Map(), // Track CAPTCHA difficulty patterns
  endpointUsage: new Map(), // Track which endpoints use CAPTCHA
  timeOfDayStats: new Map(), // Track usage patterns by hour
  dayOfWeekStats: new Map(), // Track usage patterns by day of week
};

/**
 * Record CAPTCHA generation
 */
exports.recordCaptchaGenerated = (ip, userAgent, endpoint = 'unknown') => {
  metrics.captchaGenerated++;
  
  const now = new Date();
  const hour = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const day = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const hourOfDay = now.getHours();
  const dayOfWeek = now.getDay();
  
  // Update hourly stats
  if (!metrics.hourlyStats.has(hour)) {
    metrics.hourlyStats.set(hour, { generated: 0, validated: 0, failed: 0 });
  }
  metrics.hourlyStats.get(hour).generated++;
  
  // Update daily stats
  if (!metrics.dailyStats.has(day)) {
    metrics.dailyStats.set(day, { generated: 0, validated: 0, failed: 0 });
  }
  metrics.dailyStats.get(day).generated++;
  
  // Track endpoint usage
  if (!metrics.endpointUsage.has(endpoint)) {
    metrics.endpointUsage.set(endpoint, { generated: 0, validated: 0, failed: 0 });
  }
  metrics.endpointUsage.get(endpoint).generated++;
  
  // Track time of day patterns
  if (!metrics.timeOfDayStats.has(hourOfDay)) {
    metrics.timeOfDayStats.set(hourOfDay, { generated: 0, validated: 0, failed: 0 });
  }
  metrics.timeOfDayStats.get(hourOfDay).generated++;
  
  // Track day of week patterns
  if (!metrics.dayOfWeekStats.has(dayOfWeek)) {
    metrics.dayOfWeekStats.set(dayOfWeek, { generated: 0, validated: 0, failed: 0 });
  }
  metrics.dayOfWeekStats.get(dayOfWeek).generated++;
  
  // Track user agent patterns
  if (userAgent) {
    const simplifiedUA = userAgent.includes('bot') ? 'bot' : 
                        userAgent.includes('mobile') ? 'mobile' : 
                        userAgent.includes('tablet') ? 'tablet' : 'desktop';
    
    if (!metrics.userAgents.has(simplifiedUA)) {
      metrics.userAgents.set(simplifiedUA, 0);
    }
    metrics.userAgents.set(simplifiedUA, metrics.userAgents.get(simplifiedUA) + 1);
  }
  
  logger.audit('captcha_metrics_generated', null, 'security', {
    ip,
    userAgent,
    endpoint,
    totalGenerated: metrics.captchaGenerated
  });
};

/**
 * Record CAPTCHA validation success
 */
exports.recordCaptchaValidated = (ip, sessionId, responseTime = null) => {
  metrics.captchaValidated++;
  metrics.validationAttempts++;
  
  const now = new Date();
  const hour = now.toISOString().slice(0, 13);
  const day = now.toISOString().slice(0, 10);
  const hourOfDay = now.getHours();
  const dayOfWeek = now.getDay();
  
  // Update hourly stats
  if (metrics.hourlyStats.has(hour)) {
    metrics.hourlyStats.get(hour).validated++;
  }
  
  // Update daily stats
  if (metrics.dailyStats.has(day)) {
    metrics.dailyStats.get(day).validated++;
  }
  
  // Update time of day patterns
  if (metrics.timeOfDayStats.has(hourOfDay)) {
    metrics.timeOfDayStats.get(hourOfDay).validated++;
  }
  
  // Update day of week patterns
  if (metrics.dayOfWeekStats.has(dayOfWeek)) {
    metrics.dayOfWeekStats.get(dayOfWeek).validated++;
  }
  
  // Track response times
  if (responseTime !== null) {
    metrics.responseTimes.push(responseTime);
    // Keep only last 1000 response times to prevent memory bloat
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }
  }
  
  logger.audit('captcha_metrics_validated', null, 'security', {
    ip,
    sessionId,
    responseTime,
    totalValidated: metrics.captchaValidated
  });
};

/**
 * Record CAPTCHA validation failure
 */
exports.recordCaptchaFailed = (ip, sessionId, reason) => {
  metrics.captchaFailed++;
  metrics.validationAttempts++;
  
  const now = new Date();
  const hour = now.toISOString().slice(0, 13);
  const day = now.toISOString().slice(0, 10);
  const hourOfDay = now.getHours();
  const dayOfWeek = now.getDay();
  
  // Update hourly stats
  if (metrics.hourlyStats.has(hour)) {
    metrics.hourlyStats.get(hour).failed++;
  }
  
  // Update daily stats
  if (metrics.dailyStats.has(day)) {
    metrics.dailyStats.get(day).failed++;
  }
  
  // Update time of day patterns
  if (metrics.timeOfDayStats.has(hourOfDay)) {
    metrics.timeOfDayStats.get(hourOfDay).failed++;
  }
  
  // Update day of week patterns
  if (metrics.dayOfWeekStats.has(dayOfWeek)) {
    metrics.dayOfWeekStats.get(dayOfWeek).failed++;
  }
  
  // Track IP attempts
  if (!metrics.ipAttempts.has(ip)) {
    metrics.ipAttempts.set(ip, { attempts: 0, firstAttempt: Date.now(), lastAttempt: Date.now() });
  }
  const ipData = metrics.ipAttempts.get(ip);
  ipData.attempts++;
  ipData.lastAttempt = Date.now();
  
  // Track security events by type
  if (!metrics.securityEvents.has(reason)) {
    metrics.securityEvents.set(reason, 0);
  }
  metrics.securityEvents.set(reason, metrics.securityEvents.get(reason) + 1);
  
  logger.warn('captcha_metrics_failed', {
    ip,
    sessionId,
    reason,
    totalFailed: metrics.captchaFailed,
    ipAttempts: ipData.attempts
  });
};

/**
 * Record failed authentication attempt
 */
exports.recordFailedAttempt = (ip) => {
  metrics.failedAttempts++;
  
  logger.warn('captcha_metrics_failed_attempt', {
    ip,
    totalFailedAttempts: metrics.failedAttempts
  });
};

/**
 * Record lockout event
 */
exports.recordLockout = (ip, duration) => {
  metrics.lockouts++;
  
  logger.warn('captcha_metrics_lockout', {
    ip,
    duration,
    totalLockouts: metrics.lockouts
  });
};

/**
 * Record rate limit exceeded
 */
exports.recordRateLimitExceeded = (ip, attempts) => {
  metrics.rateLimitExceeded++;
  
  // Track security events
  if (!metrics.securityEvents.has('RATE_LIMIT_EXCEEDED')) {
    metrics.securityEvents.set('RATE_LIMIT_EXCEEDED', 0);
  }
  metrics.securityEvents.set('RATE_LIMIT_EXCEEDED', metrics.securityEvents.get('RATE_LIMIT_EXCEEDED') + 1);
  
  logger.warn('captcha_metrics_rate_limit', {
    ip,
    attempts,
    totalRateLimitExceeded: metrics.rateLimitExceeded
  });
};

/**
 * Record session expiration
 */
exports.recordSessionExpiration = (ip, sessionId) => {
  metrics.sessionExpirations++;
  
  logger.info('captcha_metrics_session_expired', {
    ip,
    sessionId,
    totalExpirations: metrics.sessionExpirations
  });
};

/**
 * Record input sanitization
 */
exports.recordInputSanitization = (ip, originalLength, sanitizedLength) => {
  metrics.inputSanitizations++;
  
  logger.info('captcha_metrics_input_sanitized', {
    ip,
    originalLength,
    sanitizedLength,
    totalSanitizations: metrics.inputSanitizations
  });
};

/**
 * Record geographic data (if available)
 */
exports.recordGeographicData = (ip, country, region, city) => {
  const location = `${country}/${region}/${city}`;
  
  if (!metrics.geographicData.has(location)) {
    metrics.geographicData.set(location, { attempts: 0, firstSeen: Date.now(), lastSeen: Date.now() });
  }
  
  const geoData = metrics.geographicData.get(location);
  geoData.attempts++;
  geoData.lastSeen = Date.now();
  
  logger.info('captcha_metrics_geographic_data', {
    ip,
    location,
    attempts: geoData.attempts
  });
};

/**
 * Record CAPTCHA difficulty level
 */
exports.recordDifficultyLevel = (difficulty, success) => {
  if (!metrics.difficultyLevels.has(difficulty)) {
    metrics.difficultyLevels.set(difficulty, { attempts: 0, successes: 0, failures: 0 });
  }
  
  const diffData = metrics.difficultyLevels.get(difficulty);
  diffData.attempts++;
  
  if (success) {
    diffData.successes++;
  } else {
    diffData.failures++;
  }
  
  logger.info('captcha_metrics_difficulty_level', {
    difficulty,
    success,
    successRate: (diffData.successes / diffData.attempts * 100).toFixed(2)
  });
};

/**
 * Get current metrics
 */
exports.getMetrics = () => {
  // Calculate average response time
  const avgResponseTime = metrics.responseTimes.length > 0 
    ? (metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length).toFixed(2)
    : 0;

  // Calculate median response time
  const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b);
  const medianResponseTime = sortedTimes.length > 0 
    ? sortedTimes[Math.floor(sortedTimes.length / 2)].toFixed(2)
    : 0;

  return {
    total: {
      generated: metrics.captchaGenerated,
      validated: metrics.captchaValidated,
      failed: metrics.captchaFailed,
      failedAttempts: metrics.failedAttempts,
      lockouts: metrics.lockouts,
      rateLimitExceeded: metrics.rateLimitExceeded,
      validationAttempts: metrics.validationAttempts,
      sessionExpirations: metrics.sessionExpirations,
      inputSanitizations: metrics.inputSanitizations
    },
    successRate: metrics.captchaGenerated > 0 
      ? ((metrics.captchaValidated / (metrics.captchaValidated + metrics.captchaFailed)) * 100).toFixed(2)
      : 0,
    performance: {
      avgResponseTime: parseFloat(avgResponseTime),
      medianResponseTime: parseFloat(medianResponseTime),
      totalResponseTimes: metrics.responseTimes.length
    },
    hourlyStats: Object.fromEntries(metrics.hourlyStats),
    dailyStats: Object.fromEntries(metrics.dailyStats),
    timeOfDayStats: Object.fromEntries(metrics.timeOfDayStats),
    dayOfWeekStats: Object.fromEntries(metrics.dayOfWeekStats),
    endpointUsage: Object.fromEntries(metrics.endpointUsage),
    userAgents: Object.fromEntries(metrics.userAgents),
    geographicData: Object.fromEntries(metrics.geographicData),
    securityEvents: Object.fromEntries(metrics.securityEvents),
    difficultyLevels: Object.fromEntries(metrics.difficultyLevels),
    topIPs: Array.from(metrics.ipAttempts.entries())
      .sort((a, b) => b[1].attempts - a[1].attempts)
      .slice(0, 10)
      .map(([ip, data]) => ({
        ip,
        attempts: data.attempts,
        firstAttempt: new Date(data.firstAttempt).toISOString(),
        lastAttempt: new Date(data.lastAttempt).toISOString()
      })),
    topGeographicLocations: Array.from(metrics.geographicData.entries())
      .sort((a, b) => b[1].attempts - a[1].attempts)
      .slice(0, 10)
      .map(([location, data]) => ({
        location,
        attempts: data.attempts,
        firstSeen: new Date(data.firstSeen).toISOString(),
        lastSeen: new Date(data.lastSeen).toISOString()
      }))
  };
};

/**
 * Get metrics for a specific time period
 */
exports.getMetricsForPeriod = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const periodStats = {
    generated: 0,
    validated: 0,
    failed: 0
  };
  
  // Aggregate hourly stats for the period
  for (const [hour, stats] of metrics.hourlyStats.entries()) {
    const hourDate = new Date(hour);
    if (hourDate >= start && hourDate <= end) {
      periodStats.generated += stats.generated;
      periodStats.validated += stats.validated;
      periodStats.failed += stats.failed;
    }
  }
  
  return {
    ...periodStats,
    successRate: periodStats.generated > 0 
      ? ((periodStats.validated / (periodStats.validated + periodStats.failed)) * 100).toFixed(2)
      : 0
  };
};

/**
 * Clean up old metrics data
 */
const cleanupOldMetrics = () => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Clean up hourly stats older than 24 hours
  for (const [hour] of metrics.hourlyStats.entries()) {
    const hourDate = new Date(hour);
    if (hourDate < oneDayAgo) {
      metrics.hourlyStats.delete(hour);
    }
  }
  
  // Clean up daily stats older than 7 days
  for (const [day] of metrics.dailyStats.entries()) {
    const dayDate = new Date(day);
    if (dayDate < oneWeekAgo) {
      metrics.dailyStats.delete(day);
    }
  }
  
  // Clean up IP attempts older than 24 hours
  for (const [ip, data] of metrics.ipAttempts.entries()) {
    if (data.lastAttempt < oneDayAgo.getTime()) {
      metrics.ipAttempts.delete(ip);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldMetrics, 60 * 60 * 1000);

/**
 * Export metrics for external monitoring systems
 */
exports.exportMetrics = () => {
  const currentMetrics = exports.getMetrics();
  
  // Format for Prometheus
  const prometheusMetrics = [
    `# HELP captcha_generated_total Total number of CAPTCHAs generated`,
    `# TYPE captcha_generated_total counter`,
    `captcha_generated_total ${currentMetrics.total.generated}`,
    ``,
    `# HELP captcha_validated_total Total number of successful CAPTCHA validations`,
    `# TYPE captcha_validated_total counter`,
    `captcha_validated_total ${currentMetrics.total.validated}`,
    ``,
    `# HELP captcha_failed_total Total number of failed CAPTCHA validations`,
    `# TYPE captcha_failed_total counter`,
    `captcha_failed_total ${currentMetrics.total.failed}`,
    ``,
    `# HELP captcha_success_rate CAPTCHA validation success rate percentage`,
    `# TYPE captcha_success_rate gauge`,
    `captcha_success_rate ${currentMetrics.successRate}`,
    ``,
    `# HELP captcha_lockouts_total Total number of IP lockouts`,
    `# TYPE captcha_lockouts_total counter`,
    `captcha_lockouts_total ${currentMetrics.total.lockouts}`,
    ``,
    `# HELP captcha_rate_limit_exceeded_total Total number of rate limit violations`,
    `# TYPE captcha_rate_limit_exceeded_total counter`,
    `captcha_rate_limit_exceeded_total ${currentMetrics.total.rateLimitExceeded}`,
    ``,
    `# HELP captcha_validation_attempts_total Total number of validation attempts`,
    `# TYPE captcha_validation_attempts_total counter`,
    `captcha_validation_attempts_total ${currentMetrics.total.validationAttempts}`,
    ``,
    `# HELP captcha_session_expirations_total Total number of session expirations`,
    `# TYPE captcha_session_expirations_total counter`,
    `captcha_session_expirations_total ${currentMetrics.total.sessionExpirations}`,
    ``,
    `# HELP captcha_input_sanitizations_total Total number of input sanitizations`,
    `# TYPE captcha_input_sanitizations_total counter`,
    `captcha_input_sanitizations_total ${currentMetrics.total.inputSanitizations}`,
    ``,
    `# HELP captcha_avg_response_time_seconds Average CAPTCHA response time in seconds`,
    `# TYPE captcha_avg_response_time_seconds gauge`,
    `captcha_avg_response_time_seconds ${currentMetrics.performance.avgResponseTime}`,
    ``,
    `# HELP captcha_median_response_time_seconds Median CAPTCHA response time in seconds`,
    `# TYPE captcha_median_response_time_seconds gauge`,
    `captcha_median_response_time_seconds ${currentMetrics.performance.medianResponseTime}`,
    ``,
    `# HELP captcha_failed_attempts_total Total number of failed authentication attempts`,
    `# TYPE captcha_failed_attempts_total counter`,
    `captcha_failed_attempts_total ${currentMetrics.total.failedAttempts}`,
    ``,
    `# HELP captcha_active_sessions Current number of active CAPTCHA sessions`,
    `# TYPE captcha_active_sessions gauge`,
    `captcha_active_sessions ${currentMetrics.performance.totalResponseTimes}`,
    ``,
    `# HELP captcha_security_events_total Total number of security events by type`,
    `# TYPE captcha_security_events_total counter`
  ];

  // Add security events by type
  Object.entries(currentMetrics.securityEvents).forEach(([eventType, count]) => {
    prometheusMetrics.push(`captcha_security_events_total{event_type="${eventType}"} ${count}`);
  });

  // Add user agent metrics
  prometheusMetrics.push(``, `# HELP captcha_user_agents_total Total requests by user agent type`, `# TYPE captcha_user_agents_total counter`);
  Object.entries(currentMetrics.userAgents).forEach(([agentType, count]) => {
    prometheusMetrics.push(`captcha_user_agents_total{agent_type="${agentType}"} ${count}`);
  });

  // Add endpoint usage metrics
  prometheusMetrics.push(``, `# HELP captcha_endpoint_usage_total Total usage by endpoint`, `# TYPE captcha_endpoint_usage_total counter`);
  Object.entries(currentMetrics.endpointUsage).forEach(([endpoint, data]) => {
    prometheusMetrics.push(`captcha_endpoint_usage_total{endpoint="${endpoint}",action="generated"} ${data.generated}`);
    prometheusMetrics.push(`captcha_endpoint_usage_total{endpoint="${endpoint}",action="validated"} ${data.validated}`);
    prometheusMetrics.push(`captcha_endpoint_usage_total{endpoint="${endpoint}",action="failed"} ${data.failed}`);
  });

  // Add time of day metrics
  prometheusMetrics.push(``, `# HELP captcha_time_of_day_total Total requests by hour of day`, `# TYPE captcha_time_of_day_total counter`);
  Object.entries(currentMetrics.timeOfDayStats).forEach(([hour, data]) => {
    prometheusMetrics.push(`captcha_time_of_day_total{hour="${hour}",action="generated"} ${data.generated}`);
    prometheusMetrics.push(`captcha_time_of_day_total{hour="${hour}",action="validated"} ${data.validated}`);
    prometheusMetrics.push(`captcha_time_of_day_total{hour="${hour}",action="failed"} ${data.failed}`);
  });

  // Add day of week metrics
  prometheusMetrics.push(``, `# HELP captcha_day_of_week_total Total requests by day of week`, `# TYPE captcha_day_of_week_total counter`);
  Object.entries(currentMetrics.dayOfWeekStats).forEach(([day, data]) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[parseInt(day)] || 'Unknown';
    prometheusMetrics.push(`captcha_day_of_week_total{day="${dayName}",action="generated"} ${data.generated}`);
    prometheusMetrics.push(`captcha_day_of_week_total{day="${dayName}",action="validated"} ${data.validated}`);
    prometheusMetrics.push(`captcha_day_of_week_total{day="${dayName}",action="failed"} ${data.failed}`);
  });

  return prometheusMetrics.join('\n');
};

module.exports = exports; 