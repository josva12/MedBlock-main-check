# MedBlock Frontend (React + Vite + TypeScript)

This is the frontend for the MedBlock MERN project. It is a modern, responsive, and fully-featured healthcare management UI built with React, Vite, TypeScript, Tailwind CSS, and Heroicons. It connects seamlessly to the MedBlock backend API.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v16+ and npm installed
- MedBlock backend (Node/Express/Mongo) running (see backend README)

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Configure API URL (if needed)
- By default, the frontend expects the backend API at `http://localhost:5000/api`.
- To change, edit `src/api.ts`:
  ```ts
  export const API_BASE_URL = 'http://localhost:5000/api';
  ```

### 4. Start the Frontend
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Login and Use
- Use valid credentials (or register if enabled) to log in.
- Navigate the dashboard, manage patients, appointments, users, and more.

---

## 🛠️ Features
- **Authentication:** Login, logout, role-based access
- **Dashboard:** Quick actions and user info
- **Patients:** List, add, edit, delete, view details
- **Medical Records & Vital Signs:** View/add per patient
- **Appointments:** List, schedule, cancel
- **User Management:** (Admin only) Add/edit users
- **Modern UI:** Tailwind CSS, Heroicons, responsive design
- **Reusable Components:** Sidebar, header, modals, spinners, error messages
- **API Integration:** Centralized Axios with token handling

---

## 🐞 Troubleshooting
- **CORS errors:** Ensure your backend allows requests from `http://localhost:5173` (set CORS headers).
- **API not found:** Check that the backend is running and the API URL matches in `src/api.ts`.
- **npm errors:** Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.
- **Tailwind not working:** Ensure `tailwind.config.js` and `postcss.config.js` exist and are correct.

---

## 📝 Developer Notes
- All UI is styled with Tailwind CSS and uses Heroicons for modern icons.
- Auth state is managed globally with React Context (`src/context/AuthContext.tsx`).
- All API calls use the centralized Axios instance (`src/api.ts`).
- Routing is handled by `react-router-dom` v6, with protected routes for role-based access.
- Extend by adding new pages/components in `src/pages/` and `src/components/`.

---

## 📚 Backend Setup
See the backend README for instructions on setting up and running the MedBlock server (Node/Express/MongoDB).

---

## 💡 Need Help?
If you encounter issues, check the troubleshooting section above or review your backend logs for errors. For further help, open an issue or contact the maintainer.
