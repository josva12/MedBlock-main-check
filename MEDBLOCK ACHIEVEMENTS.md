# MEDBLOCK ACHIEVEMENTS

## Project Structure & Communication Map (Comprehensive)

### Backend (Node.js/Express/MongoDB)

- **src/server.js**: Main entry point. Sets up Express app, connects to MongoDB, applies security and utility middleware (helmet, cors, compression, morgan, rateLimit, requestId, simulateError), and mounts all routes at `/api/v1` via `src/routes/index.js`. Imports configuration and utility modules (e.g., logger, database config).
- **src/routes/**: Contains all API endpoint definitions. Each file corresponds to a resource (e.g., `patients.js`, `reports.js`, `claims.js`, `insurance.js`).
  - **index.js**: Central router, imports and mounts all other route files (e.g., `/patients`, `/insurance`, `/claims`, `/auth`, `/users`, `/medical-records`, `/vital-signs`, `/facilities`, `/appointments`, `/audit-logs`, `/reports`, `/notifications`, `/subscriptions`, `/payments`, `/chat`, `/teleconsultations`, `/predictions`, `/resources`, `/ai-chat`). Also provides health check, OpenAPI docs, and stub endpoints for AI, i18n, and privacy.
  - **insurance.js**: Handles `/api/v1/insurance` endpoints for enrolling users, fetching user policies, updating policy status (admin), expert requests, quote requests, fetching policy details, and comparing plans. Uses `InsurancePolicy` model and `authMiddleware` for authentication/authorization.
- **src/models/**: Mongoose schemas for all data entities. Used by routes to interact with MongoDB.
  - **InsurancePolicy.js**: Defines insurance policy schema, including user reference, tier, status, premium, coverage, dependents, and timestamps.
  - Other models: `Patient.js`, `User.js`, `Resource.js`, `Notification.js`, `Chat.js`, `Claim.js`, `Report.js`, `Prediction.js`, `Teleconsultation.js`, `Subscription.js`, `VitalSign.js`, `Facility.js`, `AuditLog.js`, `Appointment.js`, `MedicalRecord.js`, `Encounter.js`.
- **src/controllers/**: Business logic for routes (e.g., `appointmentController.js`, `vitalSignController.js`).
- **src/services/**: Utility and integration logic (e.g., `blockchainService.js`, `paymentService.js`).
- **src/middleware/**: Express middleware for authentication (`authMiddleware.js`), error handling, request ID, and error simulation.
- **src/utils/**: Utility functions (e.g., `logger.js`, `encryption.js`, `masking.js`, `validation.js`, `setupTestData.js`).
- **src/config/**: Configuration files (e.g., `database.js` for DB connection, `multerConfig.js` for file uploads).

**Backend Communication Flow:**
- `server.js` → mounts `routes/index.js` at `/api/v1` → each resource route (e.g., `insurance.js`) → uses models (e.g., `InsurancePolicy.js`) for DB operations.
- Middleware (e.g., `authMiddleware.js`) is used in routes for authentication/authorization.
- Controllers and services are invoked by routes for business logic and integrations.

---

### Frontend (React 18 + Redux Toolkit + Vite)

- **frontend/src/App.tsx**: Main app entry, sets up React Router and layout. Renders pages based on route.
- **frontend/src/pages/**: Each file is a page (e.g., `ReportsPage.tsx`, `ClaimsPage.tsx`, `InsuranceMarketplacePage.tsx`).
  - **InsuranceMarketplacePage.tsx**: Manages insurance company and policy display, user actions (get quote, compare, speak to expert), and modal state. Fetches data (mocked or via API), renders policy cards, and handles user interactions. Connects to `QuoteRequestModal` and (planned) `PolicyDetailModal`.
- **frontend/src/features/**: Redux slices for each resource (e.g., `claims/claimsSlice.ts`, `resources/resourcesSlice.ts`, `insurance/insuranceSlice.ts`).
  - **insurance/insuranceSlice.ts**: Defines async thunks for enrolling users, fetching user policy, updating policy status. Uses `api.ts` for backend communication. Exports selectors for policy state.
- **frontend/src/components/**: Reusable UI components.
  - **insurance/QuoteRequestModal.tsx**: Modal for submitting quote requests to `/api/v1/insurance/quote`. Receives `isOpen`, `onClose`, and `policy` props. Submits form to backend and displays status.
  - **insurance/ (planned) PolicyDetailModal.tsx**: (Planned) Modal for displaying detailed policy info from `/api/v1/insurance/policy/:policyId`.
  - **common/NotificationsDropdown.tsx**: Notification UI.
  - **layout/Header.tsx, Sidebar.tsx**: Layout components.
  - **ai/AIChatWidget.tsx, chat/ChatInterface.tsx**: AI and chat UIs.
- **frontend/src/layouts/**: Layout wrappers for different user roles (e.g., `AuthenticatedLayout.tsx`, `MainLayout.tsx`, `DoctorLayout.tsx`, etc.).
- **frontend/src/services/**: API utility (`api.ts` for Axios instance with interceptors for auth and error handling). Used by Redux thunks and direct API calls in components/pages.
- **frontend/src/store/**: Redux store setup.
- **frontend/src/hooks/**: Custom React hooks (e.g., `useAppSelector`, `useAppDispatch`, `useAuth`).
- **frontend/src/types/**: TypeScript types for app entities.
- **frontend/src/context/**: React context providers (if any).
- **frontend/src/utils/**: Utility functions for the frontend.

**Frontend Communication Flow:**
- `App.tsx` → renders a page (e.g., `InsuranceMarketplacePage.tsx`) → manages state for modals and selected policies → calls backend endpoints (`/api/v1/insurance/quote`, `/api/v1/insurance/policy/:policyId`, `/api/v1/insurance/compare`, `/api/v1/insurance/expert-request`) via Axios or Redux thunks → data is displayed in modals or tables.
- Components like `QuoteRequestModal.tsx` are rendered conditionally based on user actions.
- Redux slices use `api.ts` for all backend communication, handling JWT tokens and error responses.

---

### Cross-Stack Communication
- **Frontend pages** call **Redux thunks** or direct Axios requests to make HTTP requests to **backend API endpoints**.
- **Backend routes** use **Mongoose models** to read/write MongoDB data and return JSON responses.
- **Authentication**: JWT tokens are issued by backend and sent in Authorization headers by frontend for protected routes. Handled by Axios interceptors in `api.ts` and `authMiddleware.js` on backend.
- **Real-time/Notifications**: Frontend polls or subscribes to notification endpoints; backend pushes updates as needed.
- **AI/Chat**: Frontend AI/chat components connect to backend endpoints (e.g., `/api/v1/ai-chat`).

---

## Summary Table: Major Files & Their Roles (Comprehensive)

| File/Folder | Type | Role/Contents | Communicates With |
|-------------|------|---------------|-------------------|
| src/server.js | Backend | App entry, mounts routes, connects DB, applies middleware | All backend routes, config, utils |
| src/routes/index.js | Backend | Central router, mounts all resource routes | All route files, middleware, OpenAPI docs |
| src/routes/insurance.js | Backend | Insurance API endpoints (enroll, quote, compare, details, expert) | InsurancePolicy model, authMiddleware |
| src/models/InsurancePolicy.js | Backend | Insurance policy schema | insurance.js, MongoDB |
| src/controllers/ | Backend | Business logic for routes | Routes, models |
| src/services/ | Backend | Utility/integration logic (blockchain, payments) | Routes, models |
| src/middleware/ | Backend | Auth, error, request ID, simulation | Routes |
| src/utils/ | Backend | Logger, encryption, masking, validation | server.js, routes |
| src/config/ | Backend | DB connection, multer config | server.js, routes |
| frontend/src/App.tsx | Frontend | Main app entry, sets up routes/layout | Pages, layouts |
| frontend/src/pages/InsuranceMarketplacePage.tsx | Frontend | Insurance marketplace UI, manages modals, user actions | Components, API, Redux |
| frontend/src/features/insurance/insuranceSlice.ts | Frontend | Redux slice for insurance, async thunks/selectors | api.ts, pages |
| frontend/src/components/insurance/QuoteRequestModal.tsx | Frontend | Modal for quote requests | InsuranceMarketplacePage, API |
| frontend/src/components/insurance/ (planned) PolicyDetailModal.tsx | Frontend | (Planned) Modal for policy details | InsuranceMarketplacePage, API |
| frontend/src/components/ | Frontend | UI components (notifications, chat, layout, AI) | Pages, layouts |
| frontend/src/layouts/ | Frontend | Layout wrappers for roles | Pages, components |
| frontend/src/services/api.ts | Frontend | Axios instance for API calls, handles JWT | Redux thunks, pages, components |
| frontend/src/store/ | Frontend | Redux store setup | Slices, pages |
| frontend/src/hooks/ | Frontend | Custom React hooks | Components, pages |
| frontend/src/types/ | Frontend | TypeScript types | Components, features |
| frontend/src/context/ | Frontend | React context providers | Components |
| frontend/src/utils/ | Frontend | Utility functions | Components, features |

---

## How Files Talk to Each Other (Insurance Marketplace Example)
- **InsuranceMarketplacePage.tsx**: Manages state for selected policies, modals, and user actions. Renders policy cards with 'Get Quote' and (planned) 'Learn More' buttons. Handles compare logic and displays results in a modal. Calls backend endpoints for expert requests, quotes, and plan comparison.
- **QuoteRequestModal.tsx**: Receives `isOpen`, `onClose`, and `policy` props. Submits quote requests to backend and displays status. Communicates with `/api/v1/insurance/quote` endpoint.
- **(Planned) PolicyDetailModal.tsx**: Will fetch and display detailed policy info from backend when 'Learn More' is clicked (`/api/v1/insurance/policy/:policyId`).
- **Compare Plans**: User selects multiple policies, clicks 'Compare Plans', and results are fetched from backend and shown in a modal (`/api/v1/insurance/compare`).
- **Redux insuranceSlice.ts**: Handles async thunks for enrolling, fetching, and updating insurance policies. Uses `api.ts` for backend communication. Exposes selectors for use in pages/components.
- **api.ts**: Axios instance with interceptors for JWT and error handling. Used by Redux thunks and direct API calls in components/pages.

---

## Additional Notes
- **Modularity**: Each resource (patients, insurance, claims, etc.) is modularized in both backend and frontend, with clear separation of concerns.
- **Extensibility**: New features (e.g., AI chat, blockchain, new insurance features) can be added by creating new route files, models, Redux slices, and UI components.
- **Security**: JWT-based authentication, CORS, helmet, and rate limiting are applied in backend. Frontend handles token storage and redirects on auth errors.
- **Documentation**: OpenAPI/Swagger docs are available at `/api/v1/docs`.

---

## Industry-Level Compliance & Access Control Summary

### Authentication
- All sensitive backend endpoints require authentication using JWT tokens.
- Only logged-in users can access protected resources.

### Role-Based Access Control (RBAC)
- **Admin-only actions:**
  - User management (create, update, delete users, list all users)
  - Facility registration, verification, and deletion
  - Insurance policy status updates and blockchain verification
  - Claims processing and blockchain verification
  - Resource creation
  - Audit log and blockchain audit endpoints
- **Doctor/Nurse/Front-desk:**
  - Can access and manage patients, medical records, appointments, and vital signs as per their roles.
- **Self-access:**
  - Users can access and update their own profiles, but not others (unless admin).
- **Custom checks:**
  - For endpoints like “get user by ID” or “update user,” explicit checks ensure only admins or the user themselves can access/update.

### Blockchain Audit Endpoints
- Only admins can access blockchain audit endpoints for any entity (medical record, claim, insurance policy, facility, etc.).

### Medical Records, Claims, Insurance, Facilities
- All critical actions (creation, approval, verification) are protected by both authentication and role checks.
- All blockchain writes/reads are only performed after access is validated.

### Rate Limiting
- Sensitive mutation endpoints (e.g., patient creation) use rate limiting to prevent abuse.

### Validation
- All endpoints use express-validator to ensure data integrity and prevent injection.

### Security & Compliance Best Practices
- All secrets (JWT keys, Ethereum private keys, node URLs) are stored securely in environment variables and never committed.
- All access and mutation events are logged for auditability.
- PII and sensitive health data are encrypted at rest and in transit.
- The system is designed to comply with Kenyan health data regulations and can be adapted for other jurisdictions.

---

*This file is for documentation and can be deleted after review.* 