# MedBlock Frontend

A modern, production-ready healthcare management frontend for Kenya, built with React, Vite, TypeScript, Tailwind CSS, Redux Toolkit, and Heroicons.

## 🚀 Stack
- React + Vite + TypeScript
- Tailwind CSS (with dark/light mode)
- Redux Toolkit (state management)
- Axios (API calls)
- React Router DOM (routing)
- Heroicons (icons)

## 📁 Folder Structure
```
frontend/
├── public/
├── src/
│   ├── api/            # Axios instance
│   ├── assets/         # Images, icons
│   ├── components/     # Reusable UI components
│   ├── features/       # Redux slices (auth, patients, appointments, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Main layout (sidebar, header)
│   ├── pages/          # Main views (Dashboard, Patients, etc.)
│   ├── services/       # API service handlers
│   ├── store.ts        # Redux store
│   └── utils/          # Utility functions
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── README.md
```

## 🛠️ Setup & Run
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure API base URL:**
   - Create a `.env` file:
     ```env
     VITE_API_BASE_URL=http://localhost:3000/api/v1
     ```
3. **Start the dev server:**
   ```bash
   npm run dev
   ```
4. **Open in browser:**
   - Visit [http://localhost:5173](http://localhost:5173)

## ✨ Features
- Authentication (sign up, sign in, forgot/reset password)
- Role-based routing and access control
- CRUD for Patients, Appointments, Vitals, Medical Records, Reports
- Blockchain logs/status
- AI health chat
- Admin panel (user management, roles, audit logs, subscriptions)
- Responsive, mobile-first UI
- Dark/light mode toggle
- Kenyan healthcare branding and images

## 🧑‍💻 Usage
- Log in or register as a user (admin, doctor, nurse, pharmacy)
- Navigate using the sidebar
- Add, edit, and delete patients, appointments, vitals, records, and reports
- Access blockchain and AI features
- Admins can manage users, roles, logs, and subscriptions

## 🐞 Troubleshooting
- Ensure backend is running at the API URL in `.env`
- Check browser console for errors
- For CORS issues, ensure backend allows requests from frontend origin

---

For more details, see the backend README and API docs.
