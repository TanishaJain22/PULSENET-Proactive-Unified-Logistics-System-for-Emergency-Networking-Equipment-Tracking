import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DispatchRequest, Hospital } from '../types';

interface DispatchState {
  activeDispatch: DispatchRequest | null;
  currentDispatchId: string | null;
  pendingDispatches: DispatchRequest[];
  assignedHospital: Hospital | null;
}

const initialState: DispatchState = {
  activeDispatch: null,
  currentDispatchId: null,
  pendingDispatches: [],
  assignedHospital: null,
};

const dispatchSlice = createSlice({
  name: 'dispatch',
  initialState,
  reducers: {
    setActiveDispatch: (state, action: PayloadAction<DispatchRequest>) => {
      state.activeDispatch = action.payload;
      state.currentDispatchId = action.payload.dispatchId;
    },
    clearActiveDispatch: (state) => {
      state.activeDispatch = null;
      state.currentDispatchId = null;
      state.assignedHospital = null;
    },
    setPendingDispatches: (state, action: PayloadAction<DispatchRequest[]>) => {
      state.pendingDispatches = action.payload;
    },
    updateDispatchStatus: (state, action: PayloadAction<{ status: string }>) => {
      if (state.activeDispatch) {
        state.activeDispatch.status = action.payload.status as any;
      }
    },
    setAssignedHospital: (state, action: PayloadAction<Hospital>) => {
      state.assignedHospital = action.payload;
    },
  },
});

export const {
  setActiveDispatch, clearActiveDispatch, setPendingDispatches,
  updateDispatchStatus, setAssignedHospital,
} = dispatchSlice.actions;
export default dispatchSlice.reducer;
