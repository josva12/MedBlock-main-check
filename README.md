# MedBlock - Healthcare Management System

A comprehensive, modern healthcare management system built with Node.js, Express, MongoDB, and React. MedBlock provides a complete solution for healthcare facilities to manage patients, appointments, medical records, and more with blockchain integration for data integrity.

## 🚀 Features

### 🌙 **Frontend Features**
- **Dark/Light Mode**: System preference detection with persistent storage
- **Real-time Notifications**: Auto-updating notification system with admin controls
- **Settings & Profile Management**: Complete user profile and security settings
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Role-based UI**: Dynamic interface based on user roles

### 🏥 **Healthcare Management**
- **Patient Management**: Complete patient records and history
- **Appointment Scheduling**: Calendar-based appointment system
- **Medical Records**: Secure document storage and management
- **Vital Signs**: Real-time vital monitoring and tracking
- **Reports & Analytics**: Comprehensive healthcare analytics
- **Professional Verification**: License verification for healthcare professionals

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Doctor, Nurse, Front Desk, Pharmacy
- **Professional Verification**: License verification system
- **Audit Logging**: Complete system activity tracking
- **Data Encryption**: Secure data storage and transmission

### ⛓️ **Blockchain Integration**
- **Data Integrity**: Immutable audit trail for medical records
- **Smart Contracts**: Automated verification and compliance
- **Decentralized Storage**: Secure, distributed data storage
- **Transparency**: Public verification of data authenticity

### 🤖 **AI Integration**
- **Health Consultation**: AI-powered health advice system
- **Diagnostic Assistance**: Machine learning-based diagnostics
- **Predictive Analytics**: Health trend analysis and predictions

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with cloud storage
- **Validation**: Joi schema validation
- **Logging**: Winston logger
- **Testing**: Jest with Supertest

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with Dark Mode
- **Routing**: React Router DOM v6
- **UI Components**: Lucide React Icons
- **Build Tool**: Vite
- **Notifications**: React Hot Toast

### Infrastructure
- **Blockchain**: Ethereum/Solidity smart contracts
- **AI/ML**: TensorFlow.js for client-side ML
- **Deployment**: Docker containerization
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
MedBlock-main-check/
├── src/                           # Backend source code
│   ├── config/                    # Configuration files
│   │   ├── database.js           # MongoDB connection
│   │   └── multerConfig.js       # File upload config
│   ├── controllers/              # Route controllers
│   │   ├── appointmentController.js
│   │   ├── vitalSignController.js
│   │   └── ...                   # Other controllers
│   ├── docs/                     # API documentation
│   │   └── openapi.yaml         # OpenAPI specification
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # Authentication middleware
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   └── ...                  # Other middleware
│   ├── models/                   # MongoDB schemas
│   │   ├── Appointment.js       # Appointment model
│   │   ├── AuditLog.js          # Audit logging model
│   │   ├── Encounter.js         # Patient encounter model
│   │   ├── User.js              # User model
│   │   └── ...                  # Other models
│   ├── routes/                   # API routes
│   │   ├── adminRoutes.js       # Admin-specific routes
│   │   ├── appointments.js      # Appointment routes
│   │   ├── auditLogs.js         # Audit log routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── notifications.js     # Notification routes
│   │   ├── reports.js           # Report generation routes
│   │   ├── users.js             # User management routes
│   │   └── ...                  # Other route files
│   ├── services/                 # Business logic
│   │   └── blockchainService.js # Blockchain integration
│   ├── uploads/                  # File upload directory
│   ├── utils/                    # Utility functions
│   │   ├── encryption.js        # Data encryption
│   │   ├── logger.js            # Logging utilities
│   │   ├── masking.js           # Data masking
│   │   └── ...                  # Other utilities
│   └── server.js                 # Main server file
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── admin/           # Admin-specific components
│   │   │   ├── common/          # Common components
│   │   │   └── layout/          # Layout components
│   │   ├── context/             # React Context providers
│   │   ├── features/            # Redux slices and features
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Layout components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   └── ...                  # Other frontend files
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── ai/                          # AI/ML components
│   └── venv/                    # Python virtual environment
├── logs/                        # Application logs
├── BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md
├── CHANGELOG.md
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm 9+
- Python 3.8+ (for AI features)

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

4. **Start MongoDB**
   ```bash
   # Ensure MongoDB is running
   mongod
   ```

5. **Start the backend server**
   ```bash
   npm start
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

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medblock

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Blockchain (Optional)
ETHEREUM_NETWORK=localhost
SMART_CONTRACT_ADDRESS=0x...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=MedBlock
```

## 📊 API Documentation

The API documentation is available in OpenAPI format at `/docs/openapi.yaml`. You can view it using:

- Swagger UI: `http://localhost:3000/api-docs`
- ReDoc: `http://localhost:3000/redoc`

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update user profile
- `POST /api/v1/auth/change-password` - Change password

#### Admin Routes
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/admins` - List admin users
- `PUT /api/v1/admin/users/:id/verify` - Verify professional
- `DELETE /api/v1/admin/users/:id` - Delete user

#### Healthcare Management
- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/medical-records` - List medical records
- `POST /api/v1/vital-signs` - Record vital signs

#### Reports & Analytics
- `GET /api/v1/reports/medical-records` - Medical record trends
- `GET /api/v1/reports/appointments` - Appointment utilization
- `GET /api/v1/reports/patient-demographics` - Patient demographics

#### Notifications
- `GET /api/v1/users/:id/notifications` - Get user notifications
- `POST /api/v1/notifications/send` - Send notification (admin)
- `PATCH /api/v1/notifications/:id/read` - Mark as read

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

### API Tests
```bash
npm run test:api
```

## 🚀 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t medblock .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 medblock
   ```

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   npm install --production
   ```

2. **Database Setup**
   ```bash
   # Ensure MongoDB is configured for production
   # Set up proper authentication and network security
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Joi schema validation
- **CORS Protection**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Audit Logging**: Complete system activity tracking
- **Data Encryption**: Sensitive data encryption
- **Professional Verification**: License verification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for new features
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

## 🙏 Acknowledgments

- **Healthcare Professionals**: For domain expertise and feedback
- **Open Source Community**: For the amazing tools and libraries
- **Blockchain Community**: For decentralized technology insights
- **AI/ML Community**: For machine learning implementations

---

**MedBlock** - Modern Healthcare Management System 🇰🇪

*Empowering healthcare with modern technology* 