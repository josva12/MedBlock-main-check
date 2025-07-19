# MedBlock Frontend

A modern React application for the MedBlock healthcare management system, built with TypeScript, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

### Core Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Authentication System** - Login, registration, and password reset
- **Role-based Access Control** - Dynamic UI based on user roles
- **Lazy Loading** - Code splitting for optimal performance
- **Real-time Updates** - Live data synchronization
- **Dark/Light Mode** - Theme switching capability

### Pages & Components
- **Authentication Pages** - Login, Register, Forgot Password
- **Dashboard** - Overview with key metrics and quick actions
- **Patient Management** - CRUD operations for patient records
- **Appointment Scheduling** - Calendar-based appointment management
- **Medical Records** - Document upload and management
- **Vital Signs** - Patient vital signs tracking
- **Reports** - Medical report generation and download
- **Admin Panel** - User management and system administration
- **Blockchain Integration** - Audit trail and data integrity
- **AI Chat** - Health consultation interface

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Redux Toolkit** - State management with RTK Query
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client for API communication

## 📁 Project Structure

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── common/                 # Common components
│   │   │   └── ProtectedRoute.tsx  # Route protection component
│   │   └── layout/                 # Layout components
│   │       ├── Header.tsx          # Top navigation bar
│   │       └── Sidebar.tsx         # Side navigation menu
│   ├── features/                   # Redux slices by feature
│   │   ├── auth/                  # Authentication state
│   │   ├── patients/              # Patient management
│   │   ├── appointments/          # Appointment scheduling
│   │   ├── medicalRecords/        # Medical records
│   │   ├── vitals/                # Vital signs
│   │   ├── reports/               # Reports generation
│   │   ├── blockchain/            # Blockchain integration
│   │   ├── ai/                    # AI chat functionality
│   │   ├── admin/                 # Admin panel
│   │   └── ui/                    # UI state (theme, etc.)
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAppDispatch.ts      # Typed Redux dispatch
│   │   ├── useAppSelector.ts      # Typed Redux selector
│   │   └── useAuth.ts             # Authentication hook
│   ├── layouts/                   # Page layouts
│   │   ├── AuthenticatedLayout.tsx # Main app layout
│   │   └── MainLayout.tsx         # Alternative layout
│   ├── pages/                     # Page components
│   │   ├── LoginPage.tsx          # User login
│   │   ├── RegisterPage.tsx       # User registration
│   │   ├── ForgotPasswordPage.tsx # Password reset
│   │   ├── DashboardPage.tsx      # Main dashboard
│   │   ├── PatientsPage.tsx       # Patient management
│   │   ├── AppointmentsPage.tsx   # Appointment scheduling
│   │   ├── MedicalRecordsPage.tsx # Medical records
│   │   ├── VitalsPage.tsx         # Vital signs
│   │   ├── ReportsPage.tsx        # Reports
│   │   ├── AdminPage.tsx          # Admin panel
│   │   ├── BlockchainPage.tsx     # Blockchain status
│   │   ├── AIChatPage.tsx         # AI chat
│   │   └── NotFoundPage.tsx       # 404 page
│   ├── services/                  # API services
│   │   └── api.ts                 # Centralized API client
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── store.ts                   # Redux store configuration
│   └── index.css                  # Global styles
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.ts                 # Vite build configuration
└── package.json                   # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see main README.md)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file if it doesn't exist
   echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette
      }
    }
  },
  plugins: []
}
```

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Styling Guidelines

### Tailwind CSS Classes
- Use utility classes for consistent styling
- Follow mobile-first responsive design
- Use semantic color names from the design system

### Component Structure
```tsx
// Example component structure
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';

interface ComponentProps {
  // TypeScript interfaces for props
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic here
  
  return (
    <div className="container mx-auto p-4">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

## 🔐 Authentication Flow

1. **Login** - User enters credentials
2. **Token Storage** - JWT tokens stored in localStorage
3. **Route Protection** - ProtectedRoute component checks authentication
4. **API Calls** - Automatic token inclusion in requests
5. **Token Refresh** - Automatic refresh on 401 errors

## 📊 State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  patients: {
    items: Patient[],
    isLoading: boolean,
    error: string | null
  },
  // ... other slices
}
```

### Using Redux
```typescript
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { login } from '../features/auth/authSlice';

const Component = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);
  
  const handleLogin = () => {
    dispatch(login({ email, password }));
  };
};
```

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Structure
- Unit tests for components
- Integration tests for Redux slices
- E2E tests for critical user flows

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Vercel** - Zero-config deployment
- **Netlify** - Drag and drop deployment
- **AWS S3** - Static hosting
- **Docker** - Containerized deployment

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Component Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for async operations
- Use semantic HTML elements

### Performance
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize bundle size with code splitting
- Monitor Core Web Vitals

## 🆘 Troubleshooting

### Common Issues

1. **Styling not working**
   - Check PostCSS configuration
   - Verify Tailwind CSS is properly imported
   - Clear browser cache

2. **API calls failing**
   - Verify backend server is running
   - Check CORS configuration
   - Validate API base URL in .env

3. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Write tests for new components
4. Update documentation as needed

---

**MedBlock Frontend** - Modern Healthcare UI 🇰🇪
