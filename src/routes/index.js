console.log('✅ Main router (src/routes/index.js) loaded');
const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); // Make sure multerConfig is accessible
const logger = require('../utils/logger'); // Assuming your logger is available
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const openApiSpec = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));

// --- Import Route Files ---
const authRoutes = require('./auth');
const patientRoutes = require('./patients');
const medicalRecordRoutes = require('./medicalRecords');
const userRoutes = require('./users'); // For general user routes like GET /users/:id
const adminRoutes = require('./adminRoutes'); // Specifically for admin-only management routes
const vitalSignRoutes = require('./vitalSigns'); // For vital signs management
const facilitiesRoutes = require('./facilities');
const appointmentRoutes = require('./appointments'); // NEW: Import appointments routes
const auditLogRoutes = require('./auditLogs');
const reportRoutes = require('./reports');
const notificationRoutes = require('./notifications');

// --- TEMPORARY DIAGNOSTIC ROUTE - ADD THIS BLOCK ---
// This route MUST be defined and used BEFORE any general authentication middleware
// that might be applied to '/api/v1/*'
router.post('/temp-upload-test', upload.single('file'), (req, res) => {
    logger.info('--- TEMP UPLOAD TEST ROUTE HIT ---');
    logger.info('req.file:', req.file);
    logger.info('req.body:', req.body);

    if (req.file) {
        res.status(200).json({
            success: true,
            message: 'File received successfully by temporary test route!',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                destination: req.file.destination
            },
            body: req.body
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'No file received by temporary test route or Multer processing failed.',
            debug: { 
                multerError: req.fileError ? req.fileError.message : 'Unknown Multer error',
                body: req.body // Show body even if file is missing
            }
        });
    }
});
// --- END TEMPORARY DIAGNOSTIC ROUTE ---

// --- Public Health & API Info Endpoints ---
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MedBlock API is healthy and running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the MedBlock Healthcare API',
    version: process.env.API_VERSION || '1.0.0',
    documentation: 'API documentation will be available at /api/v1/docs'
  });
});

// --- Mount Application Routes ---
console.log('🔶 Mounting application routes...');

router.use('/auth', authRoutes); // For /api/v1/auth/login, etc.
router.use('/patients', patientRoutes); // For /api/v1/patients
router.use('/medical-records', medicalRecordRoutes); // For /api/v1/medical-records
router.use('/users', userRoutes); // For /api/v1/users (like GET /users and GET /users/:id)
router.use('/vital-signs', vitalSignRoutes); // For /api/v1/vital-signs
router.use('/facilities', facilitiesRoutes);
router.use('/appointments', appointmentRoutes); // NEW: Use appointments routes
router.use('/audit-logs', auditLogRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

// The admin routes for managing admins are mounted at the root of the API
// This makes the routes inside it like /api/v1/admin/admins and /api/v1/admin/users/:id
router.use('/admin', adminRoutes);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// --- AI & i18n Stubs ---
// i18n middleware stub (future Swahili support)
function i18nMiddleware(req, res, next) {
  // In future, detect Accept-Language or ?lang=sw and localize responses
  req.locale = req.query.lang || 'en';
  next();
}
router.use(i18nMiddleware);

// AI consult endpoint stub
router.post('/ai/consult', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'AI consult endpoint is not yet implemented. Coming soon!',
    debug: { locale: req.locale }
  });
});

// --- GDPR/HIPAA Compliance Stubs ---
// Data consent endpoint stub
router.post('/privacy/consent', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Data consent endpoint is not yet implemented. Coming soon!'
  });
});
// Data export endpoint stub
router.get('/privacy/export', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Data export endpoint is not yet implemented. Coming soon!'
  });
});
// Data deletion endpoint stub
router.delete('/privacy/delete', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Data deletion endpoint is not yet implemented. Coming soon!'
  });
});

// --- Catch-All 404 Handler for API ---
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router; 