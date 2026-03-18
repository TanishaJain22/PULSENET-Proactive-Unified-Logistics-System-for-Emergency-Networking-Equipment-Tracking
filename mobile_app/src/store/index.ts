import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import emergencyReducer from './emergencySlice';
import dispatchReducer from './dispatchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emergency: emergencyReducer,
    dispatch: dispatchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
