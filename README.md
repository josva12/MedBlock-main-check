# MedBlock - Healthcare Management System

A comprehensive healthcare management system built with React, Node.js, and blockchain technology for secure medical data management.

## 🚀 **Recent Updates & Fixes**

### ✅ **Completed Fixes**
- **Dark/Light Mode**: Implemented instant theme toggle with persistence
- **Admin Page Layout**: Fixed ugly spacing and added dark mode support
- **Profile Section**: Made functional with navigation to settings page
- **Vitals Page**: Updated to match backend structure with comprehensive vital signs
- **Front Desk Permissions**: Extended access to vitals and reports as per backend
- **TypeScript Errors**: Fixed all interface mismatches and import issues
- **Theme Toggle**: Simple one-click dark/light mode switching
- **Settings Integration**: Full profile and password management

## 📁 **Project Structure**

```
MedBlock-main-check/
├── frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                 # Admin-specific components
│   │   │   │   ├── AuditLogsTab.tsx
│   │   │   │   ├── ProfessionalVerificationTab.tsx
│   │   │   │   ├── ReportsTab.tsx
│   │   │   │   └── UserManagementTab.tsx
│   │   │   ├── common/                # Shared components
│   │   │   │   ├── NotificationsDropdown.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── layout/                # Layout components
│   │   │       ├── AuthenticatedLayout.tsx
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── context/                   # React Context
│   │   │   └── ThemeContext.tsx       # Dark/Light mode management
│   │   ├── features/                  # Redux Toolkit slices
│   │   │   ├── admin/
│   │   │   │   └── adminSlice.ts
│   │   │   ├── appointments/
│   │   │   │   └── appointmentsSlice.ts
│   │   │   ├── auth/
│   │   │   │   └── authSlice.ts
│   │   │   ├── notifications/
│   │   │   │   └── notificationsSlice.ts
│   │   │   ├── patients/
│   │   │   │   └── patientsSlice.ts
│   │   │   ├── reports/
│   │   │   │   └── reportsSlice.ts
│   │   │   ├── ui/
│   │   │   │   └── uiSlice.ts
│   │   │   └── vitals/
│   │   │       └── vitalsSlice.ts
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAppDispatch.ts
│   │   │   └── useAppSelector.ts
│   │   ├── pages/                     # Page components
│   │   │   ├── admin/
│   │   │   │   └── AdminPage.tsx
│   │   │   ├── appointments/
│   │   │   │   └── AppointmentsPage.tsx
│   │   │   ├── auth/                  # Authentication pages
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── ResetPasswordPage.tsx
│   │   │   ├── patients/
│   │   │   │   └── PatientsPage.tsx
│   │   │   ├── reports/
│   │   │   │   └── ReportsPage.tsx
│   │   │   ├── vitals/
│   │   │   │   └── VitalsPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/                  # API services
│   │   │   └── api.ts
│   │   ├── store.ts                   # Redux store configuration
│   │   ├── App.tsx                    # Main app component
│   │   ├── index.css                  # Global styles with dark mode
│   │   └── main.tsx                   # App entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── src/                               # Node.js Backend
│   ├── config/                        # Configuration files
│   │   ├── database.js
│   │   └── multerConfig.js
│   ├── controllers/                   # Route controllers
│   │   ├── appointmentController.js
│   │   └── vitalSignController.js
│   ├── docs/                          # API documentation
│   │   └── openapi.yaml
│   ├── middleware/                    # Express middleware
│   │   ├── auth.js
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/                        # MongoDB models
│   │   ├── Appointment.js
│   │   ├── AuditLog.js
│   │   ├── Encounter.js
│   │   ├── Patient.js
│   │   ├── User.js
│   │   └── VitalSign.js
│   ├── routes/                        # API routes
│   │   ├── adminRoutes.js
│   │   ├── appointments.js
│   │   ├── auditLogs.js
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── reports.js
│   │   ├── users.js
│   │   └── vitalSigns.js
│   ├── services/                      # Business logic
│   │   └── blockchainService.js
│   ├── uploads/                       # File uploads
│   ├── utils/                         # Utility functions
│   │   ├── encryption.js
│   │   ├── logger.js
│   │   ├── masking.js
│   │   └── validation.js
│   └── server.js                      # Express server
├── ai/                                # AI integration
│   └── venv/                          # Python virtual environment
├── logs/                              # Application logs
├── package.json                       # Backend dependencies
└── README.md                          # This file
```

## 🎨 **Features**

### **User Interface**
- **Dark/Light Mode**: Instant theme switching with persistence
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional healthcare interface
- **Real-time Notifications**: Admin communication system

### **Authentication & Authorization**
- **Role-based Access**: Admin, Doctor, Nurse, Front Desk, Pharmacy
- **Secure Login/Register**: JWT-based authentication
- **Password Management**: Change password functionality
- **Profile Management**: User profile updates

### **Patient Management**
- **Patient Records**: Comprehensive patient information
- **Medical History**: Allergies, conditions, insurance
- **Emergency Contacts**: Quick access to emergency information
- **Address Management**: Complete address tracking

### **Appointment System**
- **Appointment Booking**: Schedule consultations, follow-ups, emergencies
- **Status Tracking**: Scheduled, confirmed, completed, cancelled, no-show
- **Doctor Assignment**: Assign patients to specific doctors
- **Time Management**: Date and time scheduling

### **Vital Signs**
- **Comprehensive Monitoring**: Temperature, BP, heart rate, oxygen, weight, height
- **Patient Selection**: Link vitals to specific patients
- **Data Validation**: Range checking for medical accuracy
- **Notes System**: Additional observations and comments

### **Medical Reports**
- **Multiple Report Types**: Lab, imaging, pathology, consultation, discharge
- **Status Management**: Draft, completed, reviewed, approved
- **Content Management**: Findings and recommendations
- **Patient Linking**: Reports tied to specific patients

### **Admin Panel**
- **User Management**: Create, update, delete users
- **Professional Verification**: License verification system
- **Audit Logs**: Complete system activity tracking
- **Reports Dashboard**: System analytics and insights

### **Notifications System**
- **Real-time Updates**: Polling-based notification system
- **Admin Communication**: Send notifications to users
- **Status Tracking**: Read/unread notification management
- **User-specific**: Personalized notification delivery

## 🛠 **Technology Stack**

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management with RTK Query
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Hot Toast**: User notifications
- **Vite**: Fast build tool and dev server

### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token authentication
- **Multer**: File upload handling
- **Bcrypt**: Password hashing
- **Cors**: Cross-origin resource sharing

### **Development Tools**
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MedBlock-main-check
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/medblock
   JWT_SECRET=your-jwt-secret
   PORT=5000
   
   # Frontend (.env)
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development servers**
   ```bash
   # Backend (from root directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm run dev
   ```

### **Build for Production**
```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🔧 **Configuration**

### **Database Configuration**
- MongoDB connection string in `src/config/database.js`
- Environment variables for different environments

### **Authentication**
- JWT secret configuration
- Token expiration settings
- Password hashing rounds

### **File Uploads**
- Multer configuration for file handling
- Upload directory settings
- File size limits

## 📊 **API Documentation**

The API documentation is available in OpenAPI format at `src/docs/openapi.yaml`. You can view it using Swagger UI or any OpenAPI viewer.

### **Key Endpoints**
- `POST /api/auth/login` - User authentication
- `GET /api/patients` - Fetch patients
- `POST /api/appointments` - Create appointments
- `GET /api/vital-signs` - Fetch vital signs
- `POST /api/reports` - Create medical reports

## 🧪 **Testing**

### **Backend Testing**
```bash
npm test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 **Changelog**

### **v1.0.0** (Latest)
- ✅ Fixed all TypeScript compilation errors
- ✅ Implemented dark/light mode with persistence
- ✅ Fixed admin page layout and spacing
- ✅ Made profile section functional
- ✅ Updated vitals page to match backend structure
- ✅ Extended front desk permissions
- ✅ Added comprehensive notifications system
- ✅ Fixed all interface mismatches
- ✅ Updated project structure documentation

---

**MedBlock** - Secure, Modern Healthcare Management System 