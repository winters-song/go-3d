import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from './cameraSlice';

export const store = configureStore({
  reducer: {
    camera: cameraReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 