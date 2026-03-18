import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmergencyCase } from '../types';

interface EmergencyState {
  activeCase: EmergencyCase | null;
  currentCaseId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmergencyState = {
  activeCase: null,
  currentCaseId: null,
  isLoading: false,
  error: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setEmergencyCase: (state, action: PayloadAction<EmergencyCase>) => {
      state.activeCase = action.payload;
      state.currentCaseId = action.payload.caseId || (action.payload as any).id;
    },
    updateEmergencyStatus: (state, action: PayloadAction<{ status: string }>) => {
      if (state.activeCase) {
        state.activeCase.status = action.payload.status;
      }
    },
    clearEmergencyCase: (state) => {
      state.activeCase = null;
      state.currentCaseId = null;
    },
  },
});

export const { setEmergencyCase, updateEmergencyStatus, clearEmergencyCase } = emergencySlice.actions;
export default emergencySlice.reducer;
