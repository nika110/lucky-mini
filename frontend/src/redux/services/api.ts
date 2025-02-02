import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ApiError } from "@/types/api";
import WebApp from "@twa-dev/sdk";
import { STORAGE_KEYS } from "@/utils/constants";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: async (headers) => {
    const token: null | string = await new Promise((resolve) =>
      WebApp.CloudStorage.getItem(STORAGE_KEYS.TOKEN, (_, r) => {
        if (r && typeof r === "string") {
          resolve(r);
        } else {
          resolve(null);
        }
      })
    );

    if (token) {
      console.log(token);
      headers.set("Authorization", "Bearer " + token);
    }

    if (WebApp.initData) {
      headers.set("X-Telegram-Init-Data", WebApp.initData);
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

const baseQueryWithRetry = retry(baseQueryWithReauth, { maxRetries: 1 });

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  endpoints: () => ({}),
  tagTypes: ["User", "Wallet", "ReferralList"],
});
