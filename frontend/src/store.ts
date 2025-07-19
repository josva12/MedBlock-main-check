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
import aiReducer from './features/ai/aiSlice';
import blockchainReducer from './features/blockchain/blockchainSlice';

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
    ai: aiReducer,
    blockchain: blockchainReducer,
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
