# MedBlock Project Structure

```
MedBlock-main-check/
  ├── ai/
  │   └── venv/
  ├── src/
  │   ├── config/
  │   ├── controllers/
  │   ├── docs/
  │   ├── middleware/
  │   ├── models/
  │   │   └── Notification.js
  │   ├── routes/
  │   │   ├── notifications.js
  │   │   ├── patients.js
  │   │   ├── appointments.js
  │   │   └── users.js
  │   ├── server.js
  │   └── services/
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   │   └── common/
  │   │   │       └── NotificationsDropdown.tsx
  │   │   ├── features/
  │   │   │   └── notifications/
  │   │   │       └── notificationsSlice.ts
  │   │   ├── layouts/
  │   │   │   └── AuthenticatedLayout.tsx
  │   │   ├── services/
  │   │   └── store/
  │   ├── public/
  │   ├── tailwind.config.cjs
  │   ├── postcss.config.cjs
  │   └── vite.config.ts
  ├── logs/
  ├── CHANGELOG.md
  ├── BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md
  └── README.md
```

## Key Notification Files
- **Backend**
  - `src/models/Notification.js`: Mongoose schema for notifications
  - `src/routes/notifications.js`: All notification-related API endpoints
- **Frontend**
  - `frontend/src/features/notifications/notificationsSlice.ts`: Redux logic for notifications
  - `frontend/src/components/common/NotificationsDropdown.tsx`: Notification dropdown UI
  - `frontend/src/layouts/AuthenticatedLayout.tsx`: Layout with notification polling

## Notes
- All Redux slices and components now use defensive checks to prevent crashes if API calls fail.
- Backend routes for notifications, patients, and appointments now support the 'front-desk' role as needed.
- The notification system is robust, real-time, and fully integrated. 