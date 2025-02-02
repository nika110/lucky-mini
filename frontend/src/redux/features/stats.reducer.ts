import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export enum STATS {
  TAP = "tap",
}

export enum STARS {
  ONE = 1,
  TWO = 2,
  THREE = 3,
}
export type StatsTap = {
  finishScore: number;
  totalClicks: number;
  clicksPerSecond: number;
  stars: STARS;
};
export type StatsState = {
  [STATS.TAP]: StatsTap | null;
};

// Define the initial state using that type
const initialState: StatsState = {
  [STATS.TAP]: null,
};

export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setStats: (
      state,
      action: PayloadAction<{ type: STATS.TAP; payload: StatsTap }>
    ) => {
      state[action.payload.type] = action.payload.payload;
    },
    resetStats: (state, action: PayloadAction<{ type: STATS.TAP }>) => {
      state[action.payload.type] = null;
    },
    resetAllStats: () => {
      return initialState;
    },
  },
});

export const { setStats, resetAllStats, resetStats } = statsSlice.actions;

export default statsSlice.reducer;
