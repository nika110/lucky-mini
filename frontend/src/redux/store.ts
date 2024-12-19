import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rtkQueryErrorLogger } from "./middleware/errorLogger";
import { api } from "./services/api";
import { modalsSlice } from "./features/modals.reducer";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [modalsSlice.name]: modalsSlice.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(api.middleware).concat(rtkQueryErrorLogger),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
