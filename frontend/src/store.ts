import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import patientsReducer from "./features/patients/patientsSlice";
import reportsReducer from "./features/reports/reportsSlice";
import blockchainReducer from "./features/blockchain/blockchainSlice";
import aiReducer from "./features/ai/aiSlice";
import adminReducer from "./features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    reports: reportsReducer,
    blockchain: blockchainReducer,
    ai: aiReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
