const winston = require('winston');
const path = require('path');
const fs = require('fs');

console.log('🔶 Winston Logger: Starting initialization...');

// --- Robust Logs Directory Creation ---
const logsDir = path.join(__dirname, '../../logs'); // Should resolve to <project_root>/logs
let logsDirInitialized = false;
try {
  if (!fs.existsSync(logsDir)) {
    console.log(`🔶 Winston Logger: Logs directory "${logsDir}" does not exist. Attempting to create...`);
    fs.mkdirSync(logsDir, { recursive: true });
    console.log(`✅ Winston Logger: Logs directory "${logsDir}" created successfully.`);
    logsDirInitialized = true;
  } else {
    console.log(`🔶 Winston Logger: Logs directory "${logsDir}" already exists.`);
    logsDirInitialized = true;
  }
} catch (error) {
  console.error(`🔴 FATAL ERROR: Winston Logger: Could not create or access logs directory "${logsDir}". Error: ${error.message}`);
  console.error("🔴 Winston Logger: Falling back to console-only logging.");
  // Fallback logger (this block is executed if logs directory cannot be initialized)
  module.exports = {
    info: (...args) => console.info('[FALLBACK-INFO]', ...args),
    warn: (...args) => console.warn('[FALLBACK-WARN]', ...args),
    error: (...args) => console.error('[FALLBACK-ERROR]', ...args),
    debug: (...args) => console.debug('[FALLBACK-DEBUG]', ...args),
    stream: { write: (message) => console.info('[FALLBACK-STREAM]', message.trim()) },
    audit: (action, userId, resource) => console.log('[FALLBACK-AUDIT]', action, userId, resource),
    security: (event, userId) => console.log('[FALLBACK-SECURITY]', event, userId),
    medical: (action, patientId, recordType) => console.log('[FALLBACK-MEDICAL]', action, patientId, recordType),
    api: (method, url, statusCode) => console.log('[FALLBACK-API]', method, url, statusCode),
    database: (operation, collection) => console.log('[FALLBACK-DB]', operation, collection),
    // Corrected fallback signature to match expected usage in encryptionService
    encryption: (action, recordId, success, details = {}) => console.log('[FALLBACK-ENCRYPT]', action, recordId, success, details),
    performance: (operation, duration) => console.log('[FALLBACK-PERF]', operation, duration),
  };
  return;
}

// --- Basic Logger Configuration ---
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  defaultMeta: {
    service: 'medblock-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
      )
    }),
  ],
};

// --- Add File Transports (only if logsDirInitialized) ---
if (logsDirInitialized) {
  loggerConfig.transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
      format: winston.format.json()
    })
  );
  loggerConfig.transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
      format: winston.format.json()
    })
  );
} else {
  console.warn("🔶 Winston Logger: File transports disabled because logs directory couldn't be initialized.");
}

const logger = winston.createLogger(loggerConfig);

// Add custom stream for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper to redact sensitive fields from logs
const redact = (obj, fields = ['password', 'token', 'secret']) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  for (const field of fields) {
    if (clone[field]) clone[field] = '[REDACTED]';
  }
  return clone;
};

// Add custom audit method
logger.audit = (action, userId, resource, details = {}) => {
  logger.info('AUDIT_LOG', { action, userId, resource, timestamp: new Date().toISOString(), ...redact(details) });
};

// Add custom security method
logger.security = (event, userId, details = {}) => {
  logger.warn('SECURITY_EVENT', {
    event,
    userId: userId || 'N/A',
    timestamp: new Date().toISOString(),
    ...redact(details)
  });
};

// ✅ --- START OF FIX: Add the missing logger.encryption method to the main logger instance --- ✅
/**
 * Custom logging method for encryption/decryption events.
 * @param {string} action - 'encrypt' or 'decrypt' or 'encrypt_file' or 'decrypt_file'.
 * @param {string} recordId - The ID of the medical record being processed (can be null).
 * @param {boolean} success - True if the operation was successful, false otherwise.
 * @param {object} details - Additional details about the operation (e.g., dataLength, error message).
 */
logger.encryption = (action, recordId, success, details = {}) => {
  const level = success ? 'info' : 'error'; // Log success as info, failure as error
  logger[level]('ENCRYPTION_EVENT', {
    action,
    recordId: recordId || 'N/A',
    success,
    timestamp: new Date().toISOString(),
    ...redact(details)
  });
};
// ✅ --- END OF FIX --- ✅

// Add custom medical event logging (if not already present)
logger.medical = (action, patientId, recordType, details = {}) => {
  logger.info('MEDICAL_EVENT', {
    action,
    patientId,
    recordType,
    timestamp: new Date().toISOString(),
    ...redact(details)
  });
};

// Add custom API event logging (if not already present)
logger.api = (method, url, statusCode, details = {}) => {
  logger.info('API_EVENT', {
    method,
    url,
    statusCode,
    timestamp: new Date().toISOString(),
    ...redact(details)
  });
};

// Add custom Database event logging (if not already present)
logger.database = (operation, collection, details = {}) => {
  logger.info('DATABASE_EVENT', {
    operation,
    collection,
    timestamp: new Date().toISOString(),
    ...redact(details)
  });
};

// Add custom Performance event logging (if not already present)
logger.performance = (operation, duration, details = {}) => {
  logger.info('PERFORMANCE_EVENT', {
    operation,
    durationMs: duration,
    timestamp: new Date().toISOString(),
    ...redact(details)
  });
};


console.log('✅ Winston Logger: Instance created and configured.');
module.exports = logger;
