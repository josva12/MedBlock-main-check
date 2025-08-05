# MedBlock Healthcare Management System

A comprehensive healthcare management platform built with **Node.js/Express.js backend** and **React/TypeScript frontend**, featuring blockchain integration for medical record integrity and role-based access control for healthcare professionals.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** 5+
- **npm** or **yarn**
- **Git**

### Installation

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
cd ..
```

4. **Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

5. **Start the development servers**
```bash
# Start backend (from root directory)
npm run dev

# Start frontend (in another terminal, from root directory)
cd frontend && npm run dev
```

6. **Access the application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/v1/docs

## 🏗️ System Architecture

### **Technology Stack**

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer
- **Logging**: Winston
- **Validation**: Express-validator
- **Blockchain**: Ethereum integration
- **Real-time**: Socket.IO

#### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: Tailwind CSS + Headless UI
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### **System Components**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React/TS      │    │   Express.js    │    │   MongoDB       │
│   Frontend      │◄──►│   Backend API   │◄──►│   Database      │
│   (Vite)        │    │   (Node.js)     │    │   (Mongoose)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redux Store   │    │   Blockchain    │    │   File Storage  │
│   (State Mgmt)  │    │   (Ethereum)    │    │   (Multer)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 👥 User Roles & Features

### **1. Administrator**
- **Dashboard**: System overview and analytics
- **User Management**: Create, edit, and manage all users
- **Facility Management**: Manage healthcare facilities
- **Audit Logs**: Monitor system security events
- **Reports**: Generate comprehensive reports
- **System Settings**: Configure application settings

### **2. Doctor**
- **Patient Management**: View and manage assigned patients
- **Medical Records**: Create and manage patient records
- **Appointments**: Schedule and manage appointments
- **Vital Signs**: Monitor patient vital signs
- **Prescriptions**: Create and manage prescriptions
- **Blockchain Verification**: Verify medical record integrity

### **3. Nurse**
- **Patient Care**: Monitor and update patient status
- **Vital Signs**: Record and track patient vitals
- **Basic Records**: Create basic medical records
- **Notifications**: Receive patient alerts
- **Check-in/Check-out**: Manage patient admission

### **4. Patient**
- **Personal Dashboard**: View personal health information
- **Medical Records**: Access own medical records
- **Appointments**: Schedule and view appointments
- **Insurance**: Manage insurance policies and claims
- **Notifications**: Receive health updates

### **5. Pharmacy**
- **Prescriptions**: Process and dispense medications
- **Inventory**: Manage medication inventory
- **Blockchain Verification**: Verify prescription authenticity
- **Consultations**: Provide medication consultations
- **Reports**: Generate pharmacy reports

### **6. Front Desk**
- **Patient Check-in**: Register and check-in patients
- **Appointment Scheduling**: Manage appointment bookings
- **Patient Registration**: Register new patients
- **Insurance Verification**: Verify patient insurance
- **Chat Communication**: Communicate with patients and staff

### **7. Real-time Chat System**
- **Cross-Role Communication**: Chat between all user roles (doctors, nurses, patients, admin, pharmacy, front desk)
- **User Search**: Search for any user in the system by name, email, or role
- **Persistent Chat History**: All conversations are permanently stored and never disappear
- **Real-time Messaging**: Instant message delivery with Socket.IO
- **Media Sharing**: Send images, videos, and files
- **Message Reactions**: React to messages with emojis
- **Typing Indicators**: See when others are typing
- **Message Status**: Track sent, delivered, and read status
- **Chat Archiving**: Archive conversations without losing history
- **Draft Messages**: Auto-save message drafts
- **Profile Pictures**: User profile pictures in chat
- **Privacy Settings**: Control online status and last seen visibility

## 🔐 Security Features

### **Authentication & Authorization**
- **JWT-based Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions per user role
- **Password Security**: Bcrypt hashing with salt
- **Session Management**: Secure session handling
- **Rate Limiting**: Protection against brute force attacks
- **CAPTCHA Protection**: Advanced CAPTCHA system for authentication endpoints
- **IP-based Attempt Tracking**: Automatic lockout after multiple failed attempts
- **Progressive Security**: CAPTCHA appears only when needed

### **Data Protection**
- **Data Encryption**: AES-256 encryption for sensitive data
- **PII Masking**: Automatic masking of personal information
- **Audit Logging**: Complete audit trails for all actions
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin resource sharing security

### **Blockchain Integration**
- **Medical Record Integrity**: Blockchain verification for medical records
- **Immutable Audit Trail**: Tamper-proof audit logs
- **Smart Contract Integration**: Automated verification processes
- **Transaction Transparency**: Public verification of medical data

## 📊 Core Features

### **Patient Management**
- Complete patient lifecycle management
- Demographic information with Kenyan-specific fields
- Insurance and payment information
- Check-in/check-out tracking
- Assignment to healthcare providers

### **Medical Records**
- Multiple record types (lab reports, prescriptions, etc.)
- File upload and management
- Blockchain-based integrity verification
- Access level controls
- Version history tracking

### **Appointment System**
- Flexible appointment scheduling
- Provider availability management
- Patient reminders and notifications
- Appointment status tracking
- Calendar integration

### **Vital Signs Monitoring**
- Real-time vital signs tracking
- Historical data analysis
- Trend visualization
- Alert system for abnormal values
- Integration with medical devices

### **Insurance & Claims**
- Insurance marketplace
- Policy management
- Claims processing
- Payment tracking
- Coverage verification

### **Reporting & Analytics**
- Patient demographics reports
- Appointment statistics
- Financial reports
- Performance metrics
- Custom report generation

### **Notifications**
- Email notifications
- In-app notifications
- SMS alerts (configurable)
- Appointment reminders
- System alerts
- Real-time chat notifications

### **Real-time Chat System**
- **Cross-platform Communication**: Chat between all user roles
- **Persistent Conversations**: All chat history is permanently stored
- **User Search & Discovery**: Find any user in the system
- **Real-time Features**: Instant messaging, typing indicators, message status
- **Media Support**: Share images, videos, and files
- **Message Reactions**: React with emojis
- **Privacy Controls**: Manage online status and visibility
- **Chat Management**: Archive, delete, and organize conversations

## 🔧 API Documentation

### **Base URL**
```
http://localhost:3000/api/v1
```

### **Authentication Endpoints**
```
POST   /auth/login          # User login
POST   /auth/register       # User registration
POST   /auth/logout         # User logout
GET    /auth/me             # Get current user
PUT    /auth/me             # Update user profile
POST   /auth/refresh        # Refresh access token
```

### **Patient Endpoints**
```
GET    /patients            # Get all patients
POST   /patients            # Create new patient
GET    /patients/:id        # Get patient by ID
PUT    /patients/:id        # Update patient
DELETE /patients/:id        # Delete patient
GET    /patients/search     # Search patients
```

### **Medical Records Endpoints**
```
GET    /medical-records           # Get medical records
POST   /medical-records           # Create medical record
GET    /medical-records/:id       # Get record by ID
PUT    /medical-records/:id       # Update record
DELETE /medical-records/:id       # Delete record
POST   /medical-records/:id/blockchain/record    # Record on blockchain
POST   /medical-records/:id/blockchain/verify    # Verify on blockchain
```

### **Chat API Endpoints**
```
GET    /chat                    # Get user's recent chats
POST   /chat/conversation       # Create or get conversation
POST   /chat/touch-conversation # Touch conversation (create if doesn't exist)
GET    /chat/:chatId/messages   # Get messages for a chat
POST   /chat/:chatId/messages   # Send text message
POST   /chat/:chatId/media      # Send media message
PUT    /chat/:chatId/messages/delivered  # Mark messages as delivered
PUT    /chat/:chatId/messages/read       # Mark messages as read
POST   /chat/messages/:messageId/react   # Add reaction to message
DELETE /chat/messages/:messageId/react    # Remove reaction from message
PATCH  /chat/:chatId/archive    # Archive chat
PATCH  /chat/:chatId/unarchive  # Unarchive chat
DELETE /chat/:chatId            # Delete chat
GET    /users/search            # Search users for chat
```

### **Complete API Documentation**
Visit `http://localhost:3000/api/v1/docs` for interactive API documentation.

## 🚀 Deployment

### **Production Setup**

1. **Environment Configuration**
```bash
# Set production environment
NODE_ENV=production

# Configure production database
MONGODB_URI_PROD=mongodb://your-production-db

# Set JWT secrets
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret

# Configure blockchain
ETH_NODE_URL=your-ethereum-node-url
ETH_PRIVATE_KEY=your-private-key
ETH_CONTRACT_ADDRESS=your-contract-address
```

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Start Production Server**
```bash
npm start
```

### **Docker Deployment**
```bash
# Build and run with Docker
docker-compose up -d
```

## 🧪 Testing

### **Backend Testing**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=users
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
MedBlock-main-check/
├── frontend/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── chat/        # Chat system components
│   │   │   └── common/      # Common UI components
│   │   ├── features/        # Redux slices
│   │   │   └── chat/        # Chat state management
│   │   ├── layouts/         # Role-specific layouts
│   │   ├── pages/           # Route components
│   │   ├── services/        # API services
│   │   │   └── chatService.ts # Chat API service
│   │   ├── store/           # Redux store
│   │   └── types/           # TypeScript types
│   └── package.json
├── src/                     # Node.js Express Backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   │   └── chatController.js # Chat functionality
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB models
│   │   └── Chat.js          # Chat data model
│   ├── routes/              # API routes
│   │   └── chat.js          # Chat API endpoints
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── server.js            # Main server file
├── ai/                      # AI/ML Services (Python)
├── logs/                    # Application logs
├── CHAT_IMPLEMENTATION.md   # Chat system documentation
└── Documentation Files
```

## 🔗 External Integrations

### **Blockchain (Ethereum)**
- Medical record integrity verification
- Immutable audit trails
- Smart contract integration

### **Email Service**
- Nodemailer for notifications
- Template-based emails
- HTML email support

### **File Storage**
- Multer for file uploads
- Image processing with Sharp
- Secure file storage

### **AI Services**
- OpenAI integration for chat
- Medical data analysis
- Predictive analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See `IMPLEMENTATION_COMPLETE.md` for detailed implementation guide
- **Chat System**: See `CHAT_IMPLEMENTATION.md` for comprehensive chat documentation
- **CAPTCHA Security**: See `CAPTCHA_IMPLEMENTATION.md` for security implementation details
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join discussions in GitHub Discussions

## 🏆 Acknowledgments

- **Healthcare Standards**: Following HIPAA and Kenyan healthcare regulations
- **Blockchain Technology**: Ethereum for medical record integrity
- **Open Source**: Built with amazing open-source libraries
- **Community**: Thanks to all contributors and supporters

---

**MedBlock** - Revolutionizing Healthcare Management with Blockchain Technology 🏥🔗 