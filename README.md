# MedBlock Healthcare Management System

## Overview
MedBlock is a full-stack healthcare management system with blockchain integration, real-time notifications, AI chat, and robust auditing. It features a modern React + Redux frontend and a Node.js/Express/MongoDB backend.

## Features
- **Medical Records, Reports, Blockchain, AI Chat**: Real data, not placeholders
- **Responsive Layout**: Sidebar, sticky header, mobile-friendly
- **Subscriptions, Auditing, Claims, Teleconsultation, Resources, Facilities**: Full CRUD, unique icons, backend integration
- **Redux Toolkit**: Async thunks, memoized selectors (using Reselect) to prevent unnecessary rerenders
- **JWT Authentication & Role-Based Access**
- **Real-Time Notifications**: Unread counts, role-based delivery
- **Defensive Programming**: Handles API failures gracefully
- **Attractive UI**: Modern icons, Unsplash images, dropdowns for key fields

## Project Structure
- **Backend**: `src/` (Express, MongoDB, Mongoose)
- **Frontend**: `frontend/src/` (React 18, Redux Toolkit, Vite, Tailwind CSS)
- **AI**: `ai/` (optional, for future AI features)

## How to Run
1. **Backend**
   - Install dependencies: `npm install` in project root
   - Set up `.env` with MongoDB URI and JWT secret
   - Start server: `node src/server.js` (default port 3000)
2. **Frontend**
   - `cd frontend`
   - Install dependencies: `npm install`
   - Start dev server: `npm run dev` (default port 5173)

## API Endpoints
- All endpoints are prefixed with `/api/v1/`
- Key routes: `/patients`, `/appointments`, `/medical-records`, `/reports`, `/subscriptions`, `/claims`, `/teleconsultations`, `/resources`, `/facilities`, `/notifications`, `/audit-logs`

## Redux Memoized Selectors
- All slices now export memoized selectors using `createSelector` from `reselect`.
- Example usage:
  ```js
  import { useSelector } from 'react-redux';
  import { selectClaims } from '../features/claims/claimsSlice';
  const claims = useSelector(selectClaims);
  ```
- Prevents unnecessary rerenders and selector warnings.

## Troubleshooting
- **404 Errors**: Ensure backend is running and routes are mounted at `/api/v1/`
- **Selector Warnings**: Use memoized selectors from each slice
- **Add Report Not Working**: Ensure backend uses MongoDB, user is authenticated, and required fields are filled

## Recent Updates
- Switched all report, claim, teleconsultation, resource, and facility endpoints to persistent MongoDB storage
- Added memoized selectors for all Redux slices
- Improved error handling and defensive checks in all pages
- Added attractive Unsplash images and unique icons

## Contributors
- [Your Name]

---
For more details, see `CHANGELOG.md` and `BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md`. 