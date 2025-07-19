import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import patientsReducer from './features/patients/patientsSlice';
import appointmentsReducer from './features/appointments/appointmentsSlice';
import medicalRecordsReducer from './features/medicalRecords/medicalRecordsSlice';
import vitalsReducer from './features/vitals/vitalsSlice';
import reportsReducer from './features/reports/reportsSlice';
import adminReducer from './features/admin/adminSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import uiReducer from './features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
    medicalRecords: medicalRecordsReducer,
    vitals: vitalsReducer,
    reports: reportsReducer,
    admin: adminReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
