# MedBlock Project Structure

## 📁 Complete File Structure

```
MedBlock-main-check/
├── 📁 ai/                          # AI/ML related files (if any)
│   └── 📁 venv/                    # Python virtual environment
│       ├── 📁 bin/
│       ├── 📁 lib/
│       └── 📁 lib64/
│
├── 📁 src/                         # Main source code directory
│   ├── 📁 config/                  # Configuration files
│   │   ├── 📄 database.js          # Database connection configuration
│   │   └── 📄 multerConfig.js      # File upload configuration
│   │
│   ├── 📁 controllers/             # Business logic controllers
│   │   ├── 📄 appointmentController.js    # Appointment management logic
│   │   ├── 📄 auditLogController.js       # Audit log management
│   │   ├── 📄 facilityController.js       # Facility management
│   │   ├── 📄 notificationController.js   # Email notifications
│   │   ├── 📄 reportController.js         # Reporting and analytics
│   │   ├── 📄 userController.js           # User management
│   │   └── 📄 vitalSignController.js      # Vital signs management
│   │
│   ├── 📁 docs/                    # API documentation
│   │   └── 📄 openapi.yaml         # OpenAPI/Swagger specification
│   │
│   ├── 📁 middleware/              # Custom middleware functions
│   │   ├── 📄 auth.js              # Authentication middleware
│   │   ├── 📄 authMiddleware.js    # Additional auth utilities
│   │   ├── 📄 errorHandler.js      # Global error handling
│   │   ├── 📄 requestId.js         # Request ID generation
│   │   └── 📄 simulateError.js     # Error simulation for testing
│   │
│   ├── 📁 models/                  # Database models and schemas
│   │   ├── 📄 Appointment.js       # Appointment data model
│   │   ├── 📄 AuditLog.js          # Audit log data model
│   │   ├── 📄 Encounter.js         # Patient encounter model
│   │   ├── 📄 Facility.js          # Healthcare facility model
│   │   ├── 📄 MedicalRecord.js     # Medical record model
│   │   ├── 📄 Patient.js           # Patient data model
│   │   ├── 📄 User.js              # User account model
│   │   └── 📄 VitalSign.js         # Vital signs model
│   │
│   ├── 📁 routes/                  # API route definitions
│   │   ├── 📄 adminRoutes.js       # Admin-specific routes
│   │   ├── 📄 appointments.js      # Appointment routes
│   │   ├── 📄 auditLogs.js         # Audit log routes
│   │   ├── 📄 auth.js              # Authentication routes
│   │   ├── 📄 facilities.js        # Facility management routes
│   │   ├── 📄 index.js             # Main router (route aggregator)
│   │   ├── 📄 medicalRecords.js    # Medical record routes
│   │   ├── 📄 notifications.js     # Notification routes
│   │   ├── 📄 patients.js          # Patient management routes
│   │   ├── 📄 reports.js           # Reporting routes
│   │   ├── 📄 users.js             # User management routes
│   │   └── 📄 vitalSigns.js        # Vital signs routes
│   │
│   ├── 📁 services/                # External service integrations
│   │   └── 📄 blockchainService.js # Blockchain integration service
│   │
│   ├── 📁 uploads/                 # File upload storage
│   │   ├── 📁 documents/           # Medical documents
│   │   │   └── 📄 1751221442193-medical_report.pdf
│   │   ├── 📁 images/              # Medical images (X-rays, etc.)
│   │   ├── 📁 others/              # Miscellaneous files
│   │   │   └── 📄 1751220462134-medical_report.pdf
│   │   ├── 📁 reports/             # Generated reports
│   │   └── 📁 temp/                # Temporary upload storage
│   │
│   ├── 📁 utils/                   # Utility functions and helpers
│   │   ├── 📄 encryption.js        # Data encryption utilities
│   │   ├── 📄 logger.js            # Logging configuration
│   │   ├── 📄 masking.js           # PII masking utilities
│   │   └── 📄 validation.js        # Input validation helpers
│   │
│   └── 📄 server.js                # Main application entry point
│
├── 📁 logs/                        # Application log files
│   ├── 📄 app.log                  # General application logs
│   ├── 📄 error.log                # Error logs
│   ├── 📄 exceptions.log           # Unhandled exception logs
│   ├── 📄 rejections.log           # Promise rejection logs
│   └── 📄 security.log             # Security-related logs
│
├── 📄 .env                         # Environment variables
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Node.js dependencies and scripts
├── 📄 README.md                    # Project documentation
├── 📄 PROJECT_STRUCTURE.md         # This file - project structure guide
├── 📄 test_results_summary.md      # Comprehensive test results
├── 📄 BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md  # Blockchain implementation guide
├── 📄 CHANGELOG.md                 # Version history and changes
├── 📄 downloaded_dummy_report.pdf  # Sample generated report
└── 📄 downloaded_patient_record_by_id.pdf  # Sample patient record
```

## 🏗️ Architecture Overview

### Core Components

#### 1. **Controllers** (`src/controllers/`)
Business logic layer that handles HTTP requests and responses:
- **appointmentController.js**: Appointment CRUD operations and statistics
- **auditLogController.js**: Audit log retrieval and filtering
- **facilityController.js**: Healthcare facility management
- **notificationController.js**: Email notification sending
- **reportController.js**: Analytics and reporting generation
- **userController.js**: User management and administration
- **vitalSignController.js**: Vital signs management and statistics

#### 2. **Models** (`src/models/`)
Database schemas and data models:
- **Appointment.js**: Appointment scheduling and management
- **AuditLog.js**: System audit trail and security logging
- **Encounter.js**: Patient visit and treatment tracking
- **Facility.js**: Healthcare facility information
- **MedicalRecord.js**: Encrypted medical record storage
- **Patient.js**: Patient demographic and medical information
- **User.js**: User accounts and authentication
- **VitalSign.js**: Patient vital signs and health metrics

#### 3. **Routes** (`src/routes/`)
API endpoint definitions and request routing:
- **adminRoutes.js**: Administrative functions and user management
- **appointments.js**: Appointment-related endpoints
- **auditLogs.js**: Audit log access and filtering
- **auth.js**: Authentication and user registration
- **facilities.js**: Facility management endpoints
- **index.js**: Main router that aggregates all route modules
- **medicalRecords.js**: Medical record CRUD and blockchain operations
- **notifications.js**: Email notification endpoints
- **patients.js**: Patient management endpoints
- **reports.js**: Analytics and reporting endpoints
- **users.js**: User management endpoints
- **vitalSigns.js**: Vital signs management endpoints

#### 4. **Middleware** (`src/middleware/`)
Custom middleware functions for request processing:
- **auth.js**: JWT authentication and token validation
- **authMiddleware.js**: Role-based authorization and access control
- **errorHandler.js**: Global error handling and response formatting
- **requestId.js**: Request ID generation for tracking
- **simulateError.js**: Error simulation for testing purposes

#### 5. **Services** (`src/services/`)
External service integrations:
- **blockchainService.js**: Mock blockchain service for medical record integrity

#### 6. **Utils** (`src/utils/`)
Utility functions and helper modules:
- **encryption.js**: AES-256 encryption for sensitive data
- **logger.js**: Winston-based logging configuration
- **masking.js**: PII masking for privacy compliance
- **validation.js**: Input validation and sanitization

#### 7. **Config** (`src/config/`)
Configuration files:
- **database.js**: MongoDB connection and configuration
- **multerConfig.js**: File upload configuration and storage

## 🔄 Data Flow

### Request Processing Flow
1. **Request Entry** → `server.js`
2. **Route Matching** → `src/routes/index.js`
3. **Middleware Stack** → Authentication, Authorization, Validation
4. **Controller Logic** → Business logic processing
5. **Model Operations** → Database interactions
6. **Response Generation** → Formatted API response

### Security Flow
1. **Authentication** → JWT token validation
2. **Authorization** → Role-based access control
3. **Data Encryption** → Sensitive data encryption/decryption
4. **Audit Logging** → Security event tracking
5. **Input Validation** → Request data sanitization

## 📊 Database Schema

### Core Collections
- **users**: User accounts and authentication
- **patients**: Patient demographic information
- **medicalRecords**: Encrypted medical records
- **vitalSigns**: Patient vital signs data
- **appointments**: Appointment scheduling
- **encounters**: Patient visit tracking
- **facilities**: Healthcare facility information
- **auditLogs**: System audit trail

### Relationships
- **User ↔ Patient**: Doctor-patient assignments
- **User ↔ Facility**: Staff facility assignments
- **Patient ↔ MedicalRecord**: Patient medical history
- **Patient ↔ VitalSign**: Patient health metrics
- **Patient ↔ Appointment**: Patient appointments
- **Patient ↔ Encounter**: Patient visit history

## 🧪 Testing Structure

### Test Coverage
- **25 endpoints tested** across 11 modules
- **24 successful tests** with proper functionality
- **1 expected error** (facility assignment - no facilities in DB)
- **Comprehensive error handling** tested

### Test Documentation
- **test_results_summary.md**: Detailed test results table
- **BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md**: Blockchain testing guide
- **API documentation**: Complete endpoint documentation

## 🚀 Deployment Structure

### Production Files
- **server.js**: Main application entry point
- **package.json**: Dependencies and scripts
- **.env**: Environment configuration
- **logs/**: Application logging directory

### Development Files
- **ai/**: AI/ML development environment
- **src/**: Source code directory
- **docs/**: API documentation
- **uploads/**: File storage for development

## 📈 Scalability Considerations

### Modular Architecture
- **Separation of Concerns**: Clear separation between layers
- **Service Layer**: External service integrations
- **Middleware Stack**: Reusable request processing
- **Configuration Management**: Environment-based configuration

### Performance Optimization
- **Database Indexing**: Optimized query performance
- **File Upload Management**: Efficient file storage
- **Caching Strategy**: Redis integration ready
- **Logging Optimization**: Structured logging for monitoring

### Security Features
- **Data Encryption**: AES-256 encryption for sensitive data
- **Blockchain Integration**: Data integrity verification
- **Audit Logging**: Comprehensive security monitoring
- **Role-based Access**: Granular permission control 