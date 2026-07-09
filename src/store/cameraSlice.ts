import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CameraState {
  isLocked: boolean;
}

const initialState: CameraState = {
  isLocked: false,
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    setCameraLock: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
  },
});

export const { setCameraLock } = cameraSlice.actions;
export default cameraSlice.reducer;
