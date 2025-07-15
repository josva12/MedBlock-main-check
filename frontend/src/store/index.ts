import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import other feature reducers as needed

const store = configureStore({
  reducer: {
    auth: authReducer,
    // patients: patientsReducer,
    // users: usersReducer,
    // ...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 