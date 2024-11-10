import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";
import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    initializeUser: build.mutation<
      ApiResponse<User>,
      { referralCode?: string; username?: string; telegramId: string }
    >({
      query: (body) => ({
        url: "/users/initialize",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["User"],
    }),
    getUser: build.query<ApiResponse<User>, number>({
      query: (telegramId) => ({
        url: `/users/${telegramId}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useInitializeUserMutation, useGetUserQuery } = userApi;
