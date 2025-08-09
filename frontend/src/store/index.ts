import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminReducer from '../features/admin/adminSlice';
import patientsReducer from '../features/patients/patientsSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import claimsReducer from '../features/claims/claimsSlice';
import insuranceReducer from '../features/insurance/insuranceSlice';
import medicalRecordsReducer from '../features/medicalRecords/medicalRecordsSlice';
import vitalsReducer from '../features/vitals/vitalsSlice';
import resourcesReducer from '../features/resources/resourcesSlice';
import facilitiesReducer from '../features/facilities/facilitiesSlice';
import uiReducer from '../features/ui/uiSlice';
import notificationsReducer from '../features/notifications/notificationsSlice'; // Import notifications reducer
import teleconsultationsReducer from '../features/teleconsultations/teleconsultationsSlice';
import reportsReducer from '../features/reports/reportsSlice';
import blockchainReducer from '../features/blockchain/blockchainSlice';
import chatReducer from '../features/chat/chatSlice';
import pharmacyReducer from '../features/pharmacy/pharmacySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    patients: patientsReducer,
    appointments: appointmentsReducer,
    claims: claimsReducer,
    insurance: insuranceReducer,
    medicalRecords: medicalRecordsReducer,
    vitals: vitalsReducer,
    resources: resourcesReducer,
    facilities: facilitiesReducer,
    notifications: notificationsReducer, // Add notifications reducer
    teleconsultations: teleconsultationsReducer, // Add teleconsultations reducer
    ui: uiReducer,
    reports: reportsReducer,
    blockchain: blockchainReducer, // Add blockchain reducer
    chat: chatReducer, // Add chat reducer
    pharmacy: pharmacyReducer, // Add pharmacy reducer
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