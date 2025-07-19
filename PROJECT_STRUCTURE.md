# MedBlock Project Structure

This document provides a detailed overview of the MedBlock healthcare management system's project structure, including both the backend (Node.js/Express) and frontend (React/TypeScript) applications.

## 📁 Root Directory Structure

```
MedBlock-main-check/
├── frontend/                          # React Frontend Application
├── src/                              # Node.js Backend Application
├── docs/                             # Documentation files
├── tests/                            # Test files
├── .env                              # Backend environment variables
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── package.json                      # Backend dependencies
├── package-lock.json                 # Backend lock file
├── nodemon.json                      # Nodemon configuration
├── README.md                         # Main project documentation
├── CHANGELOG.md                      # Project changelog
├── PROJECT_STRUCTURE.md              # This file
├── IMPLEMENTATION_COMPLETE.md        # Implementation status
├── BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md
├── PII_MASKING_IMPLEMENTATION.md
├── VITAL_SIGNS_IMPLEMENTATION.md
└── PATIENT_SORTING_GUIDE.md
```

## 🖥️ Backend Structure (Node.js/Express)

### Core Application Files
```
src/
├── server.js                         # Main server entry point
├── config/                           # Configuration files
│   ├── database.js                   # MongoDB connection setup
│   └── multerConfig.js               # File upload configuration
├── middleware/                       # Express middleware
│   ├── auth.js                       # JWT authentication middleware
│   ├── authMiddleware.js             # Additional auth utilities
│   ├── errorHandler.js               # Global error handling
│   ├── requestId.js                  # Request ID generation
│   └── simulateError.js              # Error simulation for testing
├── models/                           # Mongoose data models
│   ├── User.js                       # User authentication model
│   ├── Patient.js                    # Patient data model
│   ├── Appointment.js                # Appointment scheduling model
│   ├── MedicalRecord.js              # Medical records model
│   ├── VitalSign.js                  # Vital signs model
│   ├── AuditLog.js                   # Audit trail model
│   ├── Encounter.js                  # Patient encounters model
│   ├── Claim.js                      # Insurance claims model
│   ├── Insurance.js                  # Insurance provider model
│   ├── Facility.js                   # Healthcare facility model
│   ├── Subscription.js               # Subscription management
│   ├── Teleconsultation.js           # Telemedicine consultations
│   ├── Prediction.js                 # AI predictions model
│   └── Resource.js                   # Healthcare resources
├── routes/                           # API route definitions
│   ├── index.js                      # Main router configuration
│   ├── auth.js                       # Authentication routes
│   ├── patients.js                   # Patient management routes
│   ├── appointments.js               # Appointment routes
│   ├── medicalRecords.js             # Medical records routes
│   ├── vitalSigns.js                 # Vital signs routes
│   ├── reports.js                    # Report generation routes
│   ├── adminRoutes.js                # Admin panel routes
│   ├── auditLogs.js                  # Audit log routes
│   ├── claims.js                     # Insurance claim routes
│   ├── insurance.js                  # Insurance routes
│   ├── facilities.js                 # Facility management routes
│   ├── subscriptions.js              # Subscription routes
│   ├── teleconsultations.js          # Telemedicine routes
│   ├── predictions.js                # AI prediction routes
│   ├── resources.js                  # Resource management routes
│   ├── notifications.js              # Notification routes
│   └── users.js                      # User management routes
├── controllers/                      # Route controller logic
│   ├── appointmentController.js      # Appointment business logic
│   ├── patients.js                   # Patient controller
│   └── vitalSignController.js        # Vital signs controller
├── services/                         # Business logic services
│   └── blockchainService.js          # Blockchain integration
├── utils/                            # Utility functions
│   ├── encryption.js                 # Data encryption utilities
│   ├── logger.js                     # Logging configuration
│   ├── masking.js                    # PII masking utilities
│   └── validation.js                 # Data validation helpers
└── docs/                             # API documentation
    └── openapi.yaml                  # OpenAPI specification
```

## 🎨 Frontend Structure (React/TypeScript)

### Core Application Files
```
frontend/
├── public/                           # Static assets
│   └── vite.svg                      # Vite logo
├── src/                              # Source code
│   ├── main.tsx                      # Application entry point
│   ├── App.tsx                       # Main application component
│   ├── index.css                     # Global styles with Tailwind
│   ├── vite-env.d.ts                 # Vite type definitions
│   ├── store.ts                      # Redux store configuration
│   ├── services/                     # API services
│   │   └── api.ts                    # Centralized API client
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAppDispatch.ts         # Typed Redux dispatch
│   │   ├── useAppSelector.ts         # Typed Redux selector
│   │   └── useAuth.ts                # Authentication hook
│   ├── layouts/                      # Page layouts
│   │   ├── AuthenticatedLayout.tsx   # Main app layout
│   │   └── MainLayout.tsx            # Alternative layout
│   ├── components/                   # Reusable UI components
│   │   ├── common/                   # Common components
│   │   │   └── ProtectedRoute.tsx    # Route protection
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx            # Top navigation
│   │   │   └── Sidebar.tsx           # Side navigation
│   │   ├── ErrorMessage.tsx          # Error display component
│   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   ├── Modal.tsx                 # Modal dialog component
│   │   └── ProtectedRoute.tsx        # Route protection (duplicate)
│   ├── features/                     # Redux slices by feature
│   │   ├── auth/                     # Authentication state
│   │   │   └── authSlice.ts          # Auth Redux slice
│   │   ├── patients/                 # Patient management
│   │   │   └── patientsSlice.ts      # Patients Redux slice
│   │   ├── appointments/             # Appointment scheduling
│   │   │   └── appointmentsSlice.ts  # Appointments Redux slice
│   │   ├── medicalRecords/           # Medical records
│   │   │   └── medicalRecordsSlice.ts # Medical records Redux slice
│   │   ├── vitals/                   # Vital signs
│   │   │   └── vitalsSlice.ts        # Vital signs Redux slice
│   │   ├── reports/                  # Reports generation
│   │   │   └── reportsSlice.ts       # Reports Redux slice
│   │   ├── blockchain/               # Blockchain integration
│   │   │   └── blockchainSlice.ts    # Blockchain Redux slice
│   │   ├── ai/                       # AI chat functionality
│   │   │   └── aiSlice.ts            # AI Redux slice
│   │   ├── admin/                    # Admin panel
│   │   │   └── adminSlice.ts         # Admin Redux slice
│   │   ├── records/                  # Records management
│   │   │   └── recordsSlice.ts       # Records Redux slice
│   │   └── ui/                       # UI state management
│   │       └── uiSlice.ts            # UI Redux slice
│   ├── pages/                        # Page components
│   │   ├── LoginPage.tsx             # User login page
│   │   ├── RegisterPage.tsx          # User registration page
│   │   ├── ForgotPasswordPage.tsx    # Password reset page
│   │   ├── DashboardPage.tsx         # Main dashboard
│   │   ├── PatientsPage.tsx          # Patient management page
│   │   ├── AppointmentsPage.tsx      # Appointment scheduling page
│   │   ├── MedicalRecordsPage.tsx    # Medical records page
│   │   ├── VitalsPage.tsx            # Vital signs page
│   │   ├── ReportsPage.tsx           # Reports page
│   │   ├── AdminPage.tsx             # Admin panel page
│   │   ├── BlockchainPage.tsx        # Blockchain status page
│   │   ├── AIChatPage.tsx            # AI chat page
│   │   ├── NotFoundPage.tsx          # 404 error page
│   │   ├── admin/                    # Admin-specific pages
│   │   │   └── AdminPage.tsx         # Admin page (duplicate)
│   │   ├── ai/                       # AI-specific pages
│   │   │   └── AIPage.tsx            # AI page (duplicate)
│   │   ├── appointments/             # Appointment-specific pages
│   │   │   └── AppointmentsPage.tsx  # Appointments page (duplicate)
│   │   ├── blockchain/               # Blockchain-specific pages
│   │   │   └── BlockchainPage.tsx    # Blockchain page (duplicate)
│   │   ├── dashboard/                # Dashboard-specific pages
│   │   │   └── DashboardPage.tsx     # Dashboard page (duplicate)
│   │   ├── patients/                 # Patient-specific pages
│   │   │   └── PatientsPage.tsx      # Patients page (duplicate)
│   │   ├── records/                  # Records-specific pages
│   │   │   └── RecordsPage.tsx       # Records page
│   │   ├── reports/                  # Reports-specific pages
│   │   │   └── ReportsPage.tsx       # Reports page (duplicate)
│   │   └── vitals/                   # Vitals-specific pages
│   │       └── VitalsPage.tsx        # Vitals page (duplicate)
│   ├── assets/                       # Static assets
│   │   ├── images/                   # Image files
│   │   └── react.svg                 # React logo
│   └── utils/                        # Utility functions
├── .env                              # Frontend environment variables
├── .gitignore                        # Frontend git ignore rules
├── index.html                        # HTML template
├── package.json                      # Frontend dependencies
├── package-lock.json                 # Frontend lock file
├── postcss.config.js                 # PostCSS configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.app.json                 # App-specific TypeScript config
├── tsconfig.node.json                # Node-specific TypeScript config
├── vite.config.ts                    # Vite build configuration
├── eslint.config.js                  # ESLint configuration
└── README.md                         # Frontend documentation
```

## 🔧 Configuration Files

### Backend Configuration
- **package.json** - Backend dependencies and scripts
- **nodemon.json** - Development server configuration
- **.env** - Environment variables (database, JWT secrets, etc.)
- **.env.example** - Environment variables template

### Frontend Configuration
- **package.json** - Frontend dependencies and scripts
- **vite.config.ts** - Vite build tool configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS processing configuration
- **tsconfig.json** - TypeScript compiler configuration
- **eslint.config.js** - Code linting configuration
- **.env** - Frontend environment variables

## 📊 Data Flow Architecture

### Backend Data Flow
1. **Request** → Express Router
2. **Middleware** → Authentication, Validation, Logging
3. **Controller** → Business Logic Processing
4. **Service** → External API Integration (Blockchain, AI)
5. **Model** → Database Operations (MongoDB)
6. **Response** → JSON Response to Frontend

### Frontend Data Flow
1. **User Action** → React Component
2. **Redux Action** → Dispatch to Store
3. **API Service** → HTTP Request to Backend
4. **State Update** → Redux Slice Update
5. **UI Re-render** → Component Update

## 🔐 Security Architecture

### Authentication Flow
1. **Login** → JWT Token Generation
2. **Token Storage** → localStorage (Frontend)
3. **API Requests** → Automatic Token Inclusion
4. **Token Validation** → Backend Middleware
5. **Token Refresh** → Automatic Refresh on Expiry

### Data Protection
- **Encryption** → End-to-end data encryption
- **PII Masking** → Automatic sensitive data masking
- **Audit Logging** → Comprehensive activity tracking
- **Role-based Access** → Granular permission control

## 🚀 Deployment Structure

### Backend Deployment
- **Production Server** → Node.js with PM2
- **Database** → MongoDB Atlas
- **File Storage** → Cloud storage (AWS S3)
- **Environment** → Production environment variables

### Frontend Deployment
- **Build Process** → Vite production build
- **Static Hosting** → CDN deployment
- **Environment** → Production API endpoints
- **Optimization** → Code splitting and lazy loading

## 📈 Performance Optimizations

### Backend Optimizations
- **Database Indexing** → Optimized MongoDB queries
- **Caching** → Redis for session management
- **Compression** → Gzip response compression
- **Rate Limiting** → API request throttling

### Frontend Optimizations
- **Code Splitting** → Lazy loading of routes
- **Bundle Optimization** → Tree shaking and minification
- **Image Optimization** → WebP format and lazy loading
- **Caching** → Service worker for offline support

## 🧪 Testing Structure

### Backend Testing
- **Unit Tests** → Individual function testing
- **Integration Tests** → API endpoint testing
- **Database Tests** → MongoDB operation testing
- **Security Tests** → Authentication and authorization

### Frontend Testing
- **Component Tests** → React component testing
- **Redux Tests** → State management testing
- **E2E Tests** → User flow testing
- **Performance Tests** → Core Web Vitals monitoring

---

This structure provides a scalable, maintainable, and secure foundation for the MedBlock healthcare management system, with clear separation of concerns between frontend and backend components. 