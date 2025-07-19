# MedBlock Frontend

A modern, responsive healthcare management system built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🌙 **Dark/Light Mode**
- **System Preference Detection**: Automatically detects OS theme preference
- **Persistent Storage**: Remembers user's theme choice
- **Smooth Transitions**: Beautiful theme switching animations
- **Global Integration**: Applied to all components

### ⚙️ **Settings & Profile Management**
- **Profile Updates**: Edit personal and professional information
- **Password Security**: Secure password change functionality
- **Theme Preferences**: Integrated theme controls
- **Real-time Validation**: Immediate form feedback

### 🔔 **Real-time Notifications System**
- **Auto-fetch**: Updates every 30 seconds
- **Admin Controls**: Send notifications to users/roles
- **Smart UI**: Unread count badges and status indicators
- **Role-based Access**: Different features for different roles

### 🏥 **Healthcare Management**
- **Patient Management**: Complete patient records
- **Appointment Scheduling**: Calendar-based appointment system
- **Medical Records**: Secure medical documentation
- **Vital Signs**: Real-time vital monitoring
- **Reports & Analytics**: Comprehensive healthcare analytics
- **Blockchain Integration**: Secure medical data storage

### 🔐 **Security & Authentication**
- **Role-based Access Control**: Admin, Doctor, Nurse, Front Desk, Pharmacy
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level security
- **Professional Verification**: License verification system

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with Dark Mode
- **Routing**: React Router DOM v6
- **UI Components**: Lucide React Icons
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── admin/                   # Admin-specific components
│   │   │   ├── UserManagementTab.tsx
│   │   │   ├── ProfessionalVerificationTab.tsx
│   │   │   ├── AuditLogsTab.tsx
│   │   │   └── ReportsTab.tsx
│   │   ├── common/                  # Common components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── NotificationsDropdown.tsx
│   │   └── layout/                  # Layout components
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── context/                     # React Context providers
│   │   └── ThemeContext.tsx         # Dark/Light mode context
│   ├── features/                    # Redux slices and features
│   │   ├── admin/                   # Admin functionality
│   │   │   └── adminSlice.ts
│   │   ├── auth/                    # Authentication
│   │   │   └── authSlice.ts
│   │   ├── notifications/           # Notifications system
│   │   │   └── notificationsSlice.ts
│   │   ├── patients/                # Patient management
│   │   │   └── patientsSlice.ts
│   │   ├── appointments/            # Appointment management
│   │   │   └── appointmentsSlice.ts
│   │   ├── medicalRecords/          # Medical records
│   │   │   └── medicalRecordsSlice.ts
│   │   ├── vitals/                  # Vital signs
│   │   │   └── vitalsSlice.ts
│   │   ├── reports/                 # Reports and analytics
│   │   │   └── reportsSlice.ts
│   │   └── ui/                      # UI state management
│   │       └── uiSlice.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAppDispatch.ts
│   │   └── useAppSelector.ts
│   ├── layouts/                     # Layout components
│   │   └── AuthenticatedLayout.tsx
│   ├── pages/                       # Page components
│   │   ├── admin/                   # Admin pages
│   │   │   └── AdminPage.tsx
│   │   ├── vitals/                  # Vitals pages
│   │   │   └── VitalsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── MedicalRecordsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── BlockchainPage.tsx
│   │   ├── AIChatPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/                    # API services
│   │   └── api.ts
│   ├── store.ts                     # Redux store configuration
│   ├── App.tsx                      # Main app component
│   └── index.css                    # Global styles
├── package.json
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
└── tailwind.config.js               # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MedBlock-main-check/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 Theme System

### Usage
The theme system is automatically available throughout the application:

1. **Automatic Detection**: Detects OS theme preference on first visit
2. **Manual Toggle**: Use the theme toggle in Settings → Appearance
3. **Persistent**: Remembers your choice across sessions

### Theme Options
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes, modern look
- **System**: Automatically follows OS preference

## 🔔 Notifications System

### Features
- **Real-time Updates**: Fetches notifications every 30 seconds
- **Unread Indicators**: Visual badges for unread notifications
- **Admin Controls**: Send notifications to specific users or roles
- **Smart Filtering**: Filter by notification type and status

### Admin Usage
1. Click the bell icon in the header
2. Click the send button (admin only)
3. Fill in notification details
4. Select target users or roles
5. Send notification

## ⚙️ Settings & Profile

### Profile Management
- Update personal information
- Edit professional details
- Change contact information

### Security Settings
- Change password securely
- View account status
- Manage verification status

### Appearance Settings
- Theme preferences
- UI customization options

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full system access, user management, notifications
- **Doctor**: Patient care, medical records, appointments
- **Nurse**: Patient care, vital signs, basic records
- **Front Desk**: Patient registration, appointments
- **Pharmacy**: Medication management

### Security Features
- JWT token authentication
- Role-based route protection
- Professional license verification
- Audit logging

## 🏥 Healthcare Features

### Patient Management
- Complete patient profiles
- Medical history tracking
- Contact information management

### Appointment System
- Calendar-based scheduling
- Status tracking
- Reminder notifications

### Medical Records
- Secure document storage
- History tracking
- Access control

### Vital Signs
- Real-time monitoring
- Historical data
- Trend analysis

### Reports & Analytics
- Patient demographics
- Appointment utilization
- Medical record trends
- Export capabilities

## 🛠️ Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Tailwind CSS for styling

### State Management
- Redux Toolkit for global state
- RTK Query for API calls
- Local state for component-specific data

### API Integration
- Axios for HTTP requests
- JWT token authentication
- Error handling and retry logic

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=MedBlock
```

### API Configuration
The application connects to the MedBlock backend API. Ensure the backend is running and accessible.

## 🚀 Deployment

### Build Process
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables for production

### Recommended Hosting
- Vercel
- Netlify
- AWS S3 + CloudFront
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

**MedBlock** - Modern Healthcare Management System
