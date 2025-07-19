# MedBlock - Secure Healthcare Management System

A comprehensive healthcare management system built with Node.js backend and React frontend, featuring blockchain integration, AI-powered consultations, and robust security measures.

## 🏥 Project Overview

MedBlock is a modern healthcare management platform designed for Kenyan healthcare facilities. It provides secure patient management, appointment scheduling, medical records, vital signs tracking, and AI-powered health consultations.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Role-based access control (Admin, Doctor, Nurse, Front-desk, Pharmacy)
- **Patient Management** - Complete CRUD operations for patient records
- **Appointment Scheduling** - Manage appointments with calendar integration
- **Medical Records** - Secure storage and retrieval of medical documents
- **Vital Signs Tracking** - Monitor and record patient vital signs
- **Reports Generation** - Generate and download medical reports
- **Blockchain Integration** - Immutable audit trail for data integrity
- **AI Health Consultations** - AI-powered chat interface for health advice

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Granular permissions based on user roles
- **Data Encryption** - End-to-end encryption for sensitive data
- **Audit Logging** - Comprehensive activity tracking
- **PII Masking** - Automatic masking of personally identifiable information

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with TypeScript support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer for document management
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, Rate limiting

### Frontend (React/TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with responsive design
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router DOM v6
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
MedBlock-main-check/
├── frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── common/              # Common components (ProtectedRoute, etc.)
│   │   │   └── layout/              # Layout components (Header, Sidebar)
│   │   ├── features/                # Redux slices by feature
│   │   │   ├── auth/               # Authentication state
│   │   │   ├── patients/           # Patient management
│   │   │   ├── appointments/       # Appointment scheduling
│   │   │   ├── medicalRecords/     # Medical records
│   │   │   ├── vitals/             # Vital signs
│   │   │   ├── reports/            # Reports generation
│   │   │   ├── blockchain/         # Blockchain integration
│   │   │   ├── ai/                 # AI chat functionality
│   │   │   └── admin/              # Admin panel
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── layouts/                # Page layouts
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   └── store.ts                # Redux store configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── vite.config.ts              # Vite build configuration
├── src/                             # Node.js Backend Application
│   ├── config/                     # Configuration files
│   ├── controllers/                # Route controllers
│   ├── middleware/                 # Express middleware
│   ├── models/                     # Mongoose models
│   ├── routes/                     # API routes
│   ├── services/                   # Business logic services
│   ├── utils/                      # Utility functions
│   └── server.js                   # Main server file
├── docs/                           # Documentation
├── tests/                          # Test files
└── README.md                       # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MedBlock-main-check
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/medblock
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## 📚 API Documentation

The API documentation is available in OpenAPI format at `/docs/openapi.yaml` when the server is running.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

#### Patients
- `GET /api/v1/patients` - Get all patients
- `POST /api/v1/patients` - Create new patient
- `GET /api/v1/patients/:id` - Get patient by ID
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

#### Appointments
- `GET /api/v1/appointments` - Get all appointments
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

## 🧪 Testing

### Backend Tests
```bash
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start production server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

**MedBlock** - Empowering Healthcare with Technology 🇰🇪 