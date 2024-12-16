import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";
import { api } from "./api";

interface InitializeUserResponse {
  token: string;
  user: User;
}

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    initializeUser: build.mutation<
      ApiResponse<InitializeUserResponse | User>,
      { referralCode?: string; initData: string; telegramId: string }
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
