# MEDBLOCK ACHIEVEMENTS

## Project Structure & Communication Map

### Backend (Node.js/Express/MongoDB)

- **src/server.js**: Entry point, sets up Express app, connects to MongoDB, mounts all routes at `/api/v1`, applies middleware.
- **src/routes/**: All API endpoints. Each file defines RESTful routes for a resource (e.g., `patients.js`, `reports.js`, `claims.js`).
  - Communicates with controllers (if present) and models.
  - Example: `reports.js` handles `/api/v1/reports` and uses the `Report` model.
- **src/models/**: Mongoose schemas for all data entities (e.g., `Patient.js`, `Report.js`, `Claim.js`).
  - Used by routes to interact with MongoDB.
- **src/controllers/**: (If present) Business logic for routes, e.g., `appointmentController.js`.
- **src/services/**: Utility services, e.g., `blockchainService.js` for blockchain integration.
- **src/middleware/**: Express middleware for authentication, error handling, etc.
- **src/utils/**: Utility functions (e.g., logging, encryption).
- **src/config/**: Configuration files (e.g., database connection, multer for uploads).

**Backend Communication Example:**
- `server.js` → mounts `routes/index.js` at `/api/v1` → `routes/reports.js` → uses `models/Report.js` for DB operations.
- Middleware like `authMiddleware.js` is used in routes for authentication/authorization.

---

### Frontend (React 18 + Redux Toolkit + Vite)

- **frontend/src/App.tsx**: Main app entry, sets up routes and layout.
- **frontend/src/pages/**: Each file is a page (e.g., `ReportsPage.tsx`, `ClaimsPage.tsx`).
  - Pages use Redux selectors and dispatch async thunks to fetch data from backend APIs.
  - Example: `ReportsPage.tsx` uses `fetchReports` thunk and `selectReports` selector from `features/reports/reportsSlice.ts`.
- **frontend/src/features/**: Redux slices for each resource (e.g., `claims/claimsSlice.ts`, `resources/resourcesSlice.ts`).
  - Each slice defines async thunks for API calls and memoized selectors (using `reselect`).
  - Slices communicate with backend via `services/api.ts`.
- **frontend/src/components/**: Reusable UI components (e.g., `common/NotificationsDropdown.tsx`, `layout/Sidebar.tsx`).
- **frontend/src/layouts/**: Layout components (e.g., `AuthenticatedLayout.tsx`, `MainLayout.tsx`).
- **frontend/src/services/**: API utility (e.g., `api.ts` for Axios instance).
- **frontend/src/store.ts**: Redux store setup.
- **frontend/src/hooks/**: Custom React hooks (e.g., `useAppSelector`, `useAppDispatch`).

**Frontend Communication Example:**
- `App.tsx` → renders a page (e.g., `ReportsPage.tsx`) → dispatches `fetchReports` thunk → thunk calls backend `/api/v1/reports` → data stored in Redux → page uses `useSelector(selectReports)` to get data.
- Components like `NotificationsDropdown.tsx` subscribe to Redux state and display real-time updates.

---

### Cross-Stack Communication
- **Frontend pages** call **Redux thunks** which use **Axios** to make HTTP requests to **backend API endpoints**.
- **Backend routes** use **Mongoose models** to read/write MongoDB data and return JSON responses.
- **Authentication**: JWT tokens are issued by backend and sent in Authorization headers by frontend for protected routes.
- **Real-time/Notifications**: Frontend polls or subscribes to notification endpoints; backend pushes updates as needed.

---

## Summary Table: Major Files & Their Roles

| File/Folder | Type | Role/Contents | Communicates With |
|-------------|------|---------------|-------------------|
| src/server.js | Backend | App entry, mounts routes, connects DB | All backend routes |
| src/routes/ | Backend | API endpoints for each resource | Models, Middleware |
| src/models/ | Backend | Mongoose schemas | Routes |
| src/controllers/ | Backend | Business logic (optional) | Routes, Models |
| src/services/ | Backend | Utility services (blockchain, etc.) | Routes |
| src/middleware/ | Backend | Auth, error handling, etc. | Routes |
| frontend/src/App.tsx | Frontend | Main app, sets up routes | Pages, Layouts |
| frontend/src/pages/ | Frontend | Page components | Redux, API, Components |
| frontend/src/features/ | Frontend | Redux slices, thunks, selectors | API, Pages |
| frontend/src/components/ | Frontend | UI components | Pages, Layouts |
| frontend/src/layouts/ | Frontend | Layout wrappers | Pages, Components |
| frontend/src/services/ | Frontend | API utilities (Axios) | Redux thunks |
| frontend/src/store.ts | Frontend | Redux store setup | Slices, Pages |

---

## How Files Talk to Each Other
- **Frontend**: Pages → Redux Thunks → API → Backend
- **Backend**: Routes → Middleware → Controllers (optional) → Models → MongoDB
- **Notifications/Real-Time**: Redux state updates trigger UI changes; backend sends/pushes updates via API

---

*This file is for documentation and can be deleted after review.* 