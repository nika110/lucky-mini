import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ApiError } from "@/types/api";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) {
      headers.set("X-Telegram-Init-Data", webApp.initData);
    }

    // OTHER SHT
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// CUSTOM ERRORS HANDLING
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const error = result.error as ApiError;

    switch (error.status) {
      case 401:
        // SMTH
        break;
      case 403:
        // SMTH
        break;
      default:
        // SMTH
        break;
    }
  }

  return result;
};

const baseQueryWithRetry = retry(baseQueryWithReauth, { maxRetries: 2 });

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  tagTypes: ["User"],
});
