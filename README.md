# MedBlock Healthcare Management System

A comprehensive, production-ready healthcare management system built with Node.js, Express, and MongoDB, specifically designed for the Kenyan healthcare sector with advanced security, privacy, and data management features.

## 🏥 Features

### Core Functionality
- **Patient Management**: Complete patient lifecycle management with Kenyan-specific fields
- **Medical Records**: Secure, encrypted medical records with blockchain integration
- **Vital Signs Management**: Comprehensive medical checklist with draft saving capabilities
- **File Upload System**: Secure file uploads for medical reports, prescriptions, lab results, and X-rays
- **User Management**: Role-based access control for healthcare professionals
- **Encounter Tracking**: Comprehensive hospital visit and treatment tracking
- **Authentication & Security**: JWT-based authentication with advanced security features

### Advanced Data Management
- **PII Masking**: Role-based Personally Identifiable Information masking for privacy compliance
- **Flexible Sorting**: Multi-field sorting with virtual field support and dual parameter formats
- **Robust Filtering**: Comprehensive filtering with validation and type-specific handling
- **Search Functionality**: Multi-field search with case-insensitive matching

### Technical Features
- **Data Encryption**: AES-256 encryption for sensitive medical data
- **Blockchain Integration**: Secure data integrity verification
- **Audit Logging**: Comprehensive audit trails for compliance
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Robust validation and sanitization
- **Error Handling**: Comprehensive error handling and logging
- **Debug Information**: Built-in debugging support for troubleshooting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/medblock/backend.git
   cd medblock-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📁 Project Structure

```
MedBlock/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── multerConfig.js      # File upload configuration
│   ├── controllers/             # Route controllers
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/            # Database seeders
│   ├── docs/
│   │   └── openapi.yaml
│   ├── logs/                   # Application logs
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── authMiddleware.js   # JWT authentication
│   │   ├── errorHandler.js     # Error handling middleware
│   │   ├── requestId.js
│   │   └── simulateError.js
│   ├── models/
│   │   ├── Encounter.js        # Hospital encounter model
│   │   ├── MedicalRecord.js    # Medical record model
│   │   ├── Patient.js          # Patient model
│   │   ├── User.js             # User model
│   │   └── VitalSign.js        # Vital signs model
│   ├── routes/
│   │   ├── adminRoutes.js      # Admin routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── index.js            # Main router
│   │   ├── medicalRecords.js   # Medical record routes
│   │   ├── patients.js         # Patient routes
│   │   └── vitalSigns.js       # Vital signs routes
│   ├── services/               # Business logic services
│   ├── uploads/                # File upload storage
│   │   ├── documents/          # Medical reports, prescriptions, lab results
│   │   ├── images/             # X-rays and medical images
│   │   ├── others/             # Miscellaneous files
│   │   └── reports/            # Generated reports
│   ├── utils/
│   │   ├── encryption.js       # Data encryption utilities
│   │   ├── logger.js           # Logging utilities
│   │   └── masking.js          # PII masking utilities
│   └── server.js               # Main server file
├── logs/                       # Application logs
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/medblock

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Encryption Configuration
AES_KEY=your-32-character-aes-encryption-key

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### Authentication & Authorization Middleware

The system uses a comprehensive middleware stack for authentication and authorization:

#### Middleware Order
For protected routes, the middleware should be applied in this specific order:
1. `authenticate` - JWT token verification
2. `requireRole` - Role-based authorization
3. `isGovernmentVerifiedProfessional` - Professional verification check (for sensitive operations)
4. `canAccessPatient` - Patient-specific access control (if applicable)
5. Route validation and handler

#### Middleware Functions

**`authenticate`** - JWT token verification
- Verifies Bearer token in Authorization header
- Populates `req.user` with user data
- Handles token expiration and validation errors

**`requireRole(allowedRoles)`** - Role-based authorization
- Takes an array of allowed roles: `['admin', 'doctor', 'nurse']`
- Includes comprehensive debug logging for troubleshooting
- Validates that `req.user` is populated before checking roles
- Returns 403 Forbidden for unauthorized roles

**`isGovernmentVerifiedProfessional`** - Professional verification
- Ensures doctors and nurses are government-verified
- Checks `req.user.isGovernmentVerified` status
- Includes debug logging for verification status
- Bypasses check for admin and other roles

**`canAccessPatient(patientIdParam)`** - Patient access control
- Validates patient ID format and existence
- Role-based access: admins/doctors (all), nurses (department), front-desk (created)
- Returns appropriate error codes for different failure scenarios

#### Debug Logging
All middleware includes comprehensive debug logging to help troubleshoot authorization issues:
- User role and verification status
- Required roles and permission checks
- Request paths and authorization results
- Detailed error messages for failed checks

### File Upload Configuration
The system supports secure file uploads with the following configuration:

- **Storage Process**: Files are first uploaded to a temporary directory (`src/uploads/temp/`) and then moved to their final categorized location based on file type
- **Storage Paths**: Files are organized by type in `src/uploads/`
  - `documents/` - Medical reports, prescriptions, lab results
  - `images/` - X-rays and medical images
  - `others/` - Miscellaneous files
  - `reports/` - Generated reports
  - `temp/` - Temporary upload directory (automatically cleaned up)

- **File Types Supported**:
  - Images: JPEG, PNG, GIF
  - Documents: PDF, DOC, DOCX
  - Maximum file size: 5MB

- **Upload Endpoint**: `POST /api/v1/patients/:id/files`
  - Requires authentication
  - Accepts multipart/form-data
  - Parameters: `file` (file), `fileType` (string), `description` (optional)

## 🚀 Usage Examples

### File Upload Example
```bash
# Upload a medical report for a patient
curl -X POST http://localhost:3000/api/v1/patients/507f1f77bcf86cd799439011/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@medical_report.pdf" \
  -F "fileType=medical_report" \
  -F "description=Patient's latest blood test results"

# Upload an X-ray image
curl -X POST http://localhost:3000/api/v1/patients/507f1f77bcf86cd799439011/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@chest_xray.jpg" \
  -F "fileType=xray" \
  -F "description=Chest X-ray showing normal findings"
```

### Patient Management Example
```bash
# Create a new patient
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "nationalId": "12345678",
    "phoneNumber": "+254700000000",
    "email": "john.doe@email.com",
    "address": {
      "street": "123 Main St",
      "city": "Nairobi",
      "county": "Nairobi",
      "postalCode": "00100"
    }
  }'
```

## 📚 API Documentation

### Interactive API Docs (Swagger UI)
- **Swagger UI:** [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
- **OpenAPI Spec:** See `src/docs/openapi.yaml`
- **Postman Collection:** (Coming soon)

### Request Tracing
- Every request is assigned a unique `X-Request-Id` header for end-to-end traceability.

### Simulated Error for QA
- Add `?simulateError=true` to any request to trigger a test error (returns HTTP 418).

### GDPR/HIPAA Compliance Stubs
- `POST /api/v1/privacy/consent` — Data consent (stub)
- `GET /api/v1/privacy/export` — Data export (stub)
- `DELETE /api/v1/privacy/delete` — Data deletion (stub)

### AI & i18n Stubs
- `POST /api/v1/ai/consult` — AI consult endpoint (stub)
- All endpoints support a `?lang=sw` query for future Swahili localization (stub)

### API Key Usage (for integrations)
- Pass `x-api-key` header or `?apiKey=...` query param. See middleware for validation logic.

### Monitoring & Observability
- Winston logger with rotating files in `/logs`
- Request, audit, and security logs
- Sentry/New Relic integration (see `.env.example`)

## 📊 Data Management Features

### Sorting Capabilities
- **13 Sortable Fields**: Including virtual fields like `fullName` and `age`
- **Dual Parameter Support**: Both new (`sortBy`/`sortOrder`) and legacy (`sort`) formats
- **Virtual Field Handling**: Special logic for computed fields
- **Performance Optimized**: Uses indexed fields where possible

### Filtering Capabilities
- **16 Filterable Fields**: Comprehensive filtering options
- **Type-Specific Handling**: Different logic for strings, booleans, dates, and numbers
- **Validation**: Whitelist validation to prevent injection attacks
- **Case-Insensitive**: String matching with regex support

### PII Masking Examples
- **Phone Numbers**: `+254712345678` → `+254***678`
- **Email Addresses**: `john.doe@example.com` → `j***@example.com`
- **National IDs**: `12345678` → `123***78`
- **Addresses**: Street and ward information redacted for non-admin users

### Phone Number Validation
The system supports robust Kenyan phone number validation:
- **Format Support**: Both `+254` and `0` prefixes
- **Network Codes**: Supports Safaricom (7) and Airtel (1) numbers
- **Regex Pattern**: `/^\+?254[17]\d{8}$|^0[17]\d{8}$/`
- **Valid Examples**: 
  - `+254712345678` (Safaricom with +254)
  - `254712345678` (Safaricom without +)
  - `0712345678` (Safaricom with 0)
  - `+254123456789` (Airtel with +254)
  - `0123456789` (Airtel with 0)

## 🛡️ Error Handling

### Comprehensive Error Responses
- **400 Bad Request**: Invalid parameters, validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

### Debug Information
API responses include debugging data for troubleshooting:
```json
{
  "debug": {
    "sortApplied": { "firstName": 1, "lastName": 1 },
    "sortBy": "fullName",
    "sortOrder": "asc",
    "filterBy": "county",
    "filterValue": "Nairobi",
    "allowedFilterFields": [...]
  }
}
```

## 📖 Documentation

### System Documentation
- **`PII_MASKING_IMPLEMENTATION.md`**: Complete guide to PII masking implementation
- **`PATIENT_SORTING_GUIDE.md`**: Comprehensive sorting functionality documentation
- **`VITAL_SIGNS_IMPLEMENTATION.md`**: Complete guide to vital signs implementation
- **API Examples**: Ready-to-use query examples for all features

### Best Practices
- Use the new sorting format (`sortBy`/`sortOrder`) for better clarity
- Combine sorting and filtering with pagination for large datasets
- Monitor audit logs for security and compliance
- Use indexed fields for optimal performance
- Test PII masking with different user roles

## 🔄 Recent Updates

### Version 2.0 Features
- ✅ **Vital Signs Management**: Comprehensive medical checklist with draft saving capabilities
- ✅ **PII Masking**: Role-based data privacy protection
- ✅ **Advanced Sorting**: Multi-field sorting with virtual field support
- ✅ **Robust Filtering**: Comprehensive filtering with validation
- ✅ **Debug Information**: Built-in troubleshooting support
- ✅ **Enhanced Security**: Improved input validation and error handling
- ✅ **Comprehensive Documentation**: Complete guides and examples

### Latest Improvements
- ✅ **Virtual Field Resilience**: Fixed virtual fields to handle unpopulated vital signs references
- ✅ **Draft Functionality**: Save incomplete vital signs as drafts and finalize later
- ✅ **Status Tracking**: Draft, final, and amended status with audit trails
- ✅ **Automatic Calculations**: BMI calculation from weight and height
- ✅ **Comprehensive Validation**: Medical range validation for all vital measurements
- ✅ **Rate Limiting**: Production-ready rate limiting with 50 requests per 15-minute window
- ✅ **Cross-Cutting Concerns**: Comprehensive testing of rate limiting and mass operation prevention
- ✅ **File Upload Security**: Enhanced file upload system with proper validation and storage
- ✅ **Professional Verification System**: Comprehensive verification workflow for healthcare professionals
- ✅ **Government Verification Middleware**: Enforces verification requirements for sensitive operations
- ✅ **Admin Verification Endpoints**: Complete admin interface for managing professional verification
- ✅ **Enhanced User Model**: Detailed professional verification sub-document with audit trails

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation files in the `documentation/` directory
- Review the debug information in API responses for troubleshooting

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added blockchain integration
- **v1.2.0** - Enhanced security features
- **v1.3.0** - Added comprehensive audit logging

---

**MedBlock Team** - Building the future of healthcare in Kenya 🇰🇪 