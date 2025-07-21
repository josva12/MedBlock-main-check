# MEDBLOCK ACHIEVEMENTS

## Project Structure & Communication Map (Updated)

### Backend (Node.js/Express/MongoDB)

- **src/server.js**: Entry point, sets up Express app, connects to MongoDB, mounts all routes at `/api/v1`, applies middleware.
- **src/routes/**: All API endpoints. Each file defines RESTful routes for a resource (e.g., `patients.js`, `reports.js`, `claims.js`, `insurance.js`).
  - Communicates with controllers (if present) and models.
  - Example: `insurance.js` handles `/api/v1/insurance` endpoints for quotes, policy details, and plan comparison.
- **src/models/**: Mongoose schemas for all data entities (e.g., `Patient.js`, `Report.js`, `Claim.js`, `InsurancePolicy.js`).
  - Used by routes to interact with MongoDB.
- **src/controllers/**: (If present) Business logic for routes, e.g., `appointmentController.js`.
- **src/services/**: Utility services, e.g., `blockchainService.js` for blockchain integration.
- **src/middleware/**: Express middleware for authentication, error handling, etc.
- **src/utils/**: Utility functions (e.g., logging, encryption).
- **src/config/**: Configuration files (e.g., database connection, multer for uploads).

**Backend Communication Example:**
- `server.js` → mounts `routes/index.js` at `/api/v1` → `routes/insurance.js` → uses `models/InsurancePolicy.js` for DB operations.
- Middleware like `authMiddleware.js` is used in routes for authentication/authorization.

---

### Frontend (React 18 + Redux Toolkit + Vite)

- **frontend/src/App.tsx**: Main app entry, sets up routes and layout.
- **frontend/src/pages/**: Each file is a page (e.g., `ReportsPage.tsx`, `ClaimsPage.tsx`, `InsuranceMarketplacePage.tsx`).
  - Pages use Redux selectors and dispatch async thunks to fetch data from backend APIs.
  - Example: `InsuranceMarketplacePage.tsx` manages insurance company and policy display, quote requests, and plan comparison.
- **frontend/src/features/**: Redux slices for each resource (e.g., `claims/claimsSlice.ts`, `resources/resourcesSlice.ts`).
  - Each slice defines async thunks for API calls and memoized selectors (using `reselect`).
  - Slices communicate with backend via `services/api.ts`.
- **frontend/src/components/**: Reusable UI components (e.g., `common/NotificationsDropdown.tsx`, `layout/Sidebar.tsx`, `insurance/QuoteRequestModal.tsx`).
  - **insurance/QuoteRequestModal.tsx**: Modal for submitting quote requests to `/api/v1/insurance/quote`.
- **frontend/src/layouts/**: Layout components (e.g., `AuthenticatedLayout.tsx`, `MainLayout.tsx`).
- **frontend/src/services/**: API utility (e.g., `api.ts` for Axios instance).
- **frontend/src/store.ts**: Redux store setup.
- **frontend/src/hooks/**: Custom React hooks (e.g., `useAppSelector`, `useAppDispatch`).

**Frontend Communication Example:**
- `App.tsx` → renders a page (e.g., `InsuranceMarketplacePage.tsx`) → manages state for modals and selected policies → calls backend `/api/v1/insurance/quote`, `/api/v1/insurance/policy/:policyId`, `/api/v1/insurance/compare` → data is displayed in modals or tables.
- Components like `QuoteRequestModal.tsx` are rendered conditionally based on user actions.

---

### Cross-Stack Communication
- **Frontend pages** call **Redux thunks** or direct Axios requests to make HTTP requests to **backend API endpoints**.
- **Backend routes** use **Mongoose models** to read/write MongoDB data and return JSON responses.
- **Authentication**: JWT tokens are issued by backend and sent in Authorization headers by frontend for protected routes.
- **Real-time/Notifications**: Frontend polls or subscribes to notification endpoints; backend pushes updates as needed.

---

## Summary Table: Major Files & Their Roles (Updated)

| File/Folder | Type | Role/Contents | Communicates With |
|-------------|------|---------------|-------------------|
| src/server.js | Backend | App entry, mounts routes, connects DB | All backend routes |
| src/routes/insurance.js | Backend | Insurance API endpoints (quote, compare, policy details) | Models, Middleware |
| src/models/InsurancePolicy.js | Backend | Insurance policy schema | Routes |
| frontend/src/pages/InsuranceMarketplacePage.tsx | Frontend | Insurance marketplace UI, manages modals | Components, API |
| frontend/src/components/insurance/QuoteRequestModal.tsx | Frontend | Modal for quote requests | InsuranceMarketplacePage, API |
| frontend/src/components/insurance/ (planned) | Frontend | (Planned) PolicyDetailModal for 'Learn More' | InsuranceMarketplacePage, API |
| frontend/src/features/ | Frontend | Redux slices, thunks, selectors | API, Pages |
| frontend/src/components/ | Frontend | UI components | Pages, Layouts |
| frontend/src/layouts/ | Frontend | Layout wrappers | Pages, Components |
| frontend/src/services/ | Frontend | API utilities (Axios) | Redux thunks |
| frontend/src/store.ts | Frontend | Redux store setup | Slices, Pages |

---

## How Files Talk to Each Other (Insurance Marketplace Example)
- **InsuranceMarketplacePage.tsx**: Manages state for selected policies, modals, and user actions. Renders policy cards with 'Get Quote' and (planned) 'Learn More' buttons. Handles compare logic and displays results in a modal.
- **QuoteRequestModal.tsx**: Receives `isOpen`, `onClose`, and `policy` props. Submits quote requests to backend and displays status.
- **(Planned) PolicyDetailModal.tsx**: Will fetch and display detailed policy info from backend when 'Learn More' is clicked.
- **Compare Plans**: User selects multiple policies, clicks 'Compare Plans', and results are fetched from backend and shown in a modal.

---

*This file is for documentation and can be deleted after review.* 