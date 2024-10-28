import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import { ApiError } from "@/types/api";

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as ApiError;

    console.error("API Error:", {
      status: error.status,
      data: error.data,
    });

    // throw error;
  }

  return next(action);
};
