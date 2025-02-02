import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export enum MODALS {
  BUY_TICKET = "BUY_TICKET",
  ERROR = "ERROR",
  PURCHASE_SUCCESS = "PURCHASE_SUCCESS",
  PURCHASE_LOADING = "PURCHASE_LOADING",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  WON_RAFFLE = "WON_RAFFLE",
  YOU_LOST = "YOU_LOST",
  FINISH_LUCKY_TAP = "FINISH_LUCKY_TAP",
  RULES_LUCKY_TAP = "RULES_LUCKY_TAP",
  INFO_LUCKY_31 = "INFO_LUCKY_31",
  SOON = "SOON",
}

// Define a type for the slice state
type ModalsState = Record<MODALS, boolean>;

// Define the initial state using that type
const initialState: ModalsState = {
  [MODALS.BUY_TICKET]: false,
  [MODALS.ERROR]: false,
  [MODALS.PURCHASE_SUCCESS]: false,
  [MODALS.PURCHASE_LOADING]: false,
  [MODALS.WALLET_NOT_CONNECTED]: false,
  [MODALS.WON_RAFFLE]: false,
  [MODALS.YOU_LOST]: false,
  [MODALS.FINISH_LUCKY_TAP]: false,
  [MODALS.RULES_LUCKY_TAP]: true,
  [MODALS.INFO_LUCKY_31]: false,
  [MODALS.SOON]: false,
};

export const modalsSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    toggleModal: (state, action: PayloadAction<{key: MODALS, value: boolean} | {key: MODALS, value: boolean}[]>) => {
      if (Array.isArray(action.payload)) {
        action.payload.forEach((item) => {
          state[item.key] = item.value;
        });
      } else {
        state[action.payload.key] = action.payload.value; 
      }   
    },
    resetAllModals: () => {
      return initialState;
    },
  },
});

export const { toggleModal, resetAllModals } = modalsSlice.actions;

export default modalsSlice.reducer;
