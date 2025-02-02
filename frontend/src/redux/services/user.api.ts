import { ApiResponse } from "@/types/api";
import { ReferralUser, User } from "@/types/user";
import { api } from "./api";

interface InitializeUserResponse {
  token: string;
  user: User;
}

interface ReferralListResponse {
  referrals: ReferralUser[];
}

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    initializeUser: build.mutation<
      ApiResponse<InitializeUserResponse>,
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
    getUserReferralList: build.query<
      ApiResponse<ReferralListResponse>,
      { telegramId: string }
    >({
      query: ({ telegramId }) => ({
        url: `/users/${telegramId}/referrals`,
        method: "GET",
      }),
      providesTags: ["ReferralList"],
    })
  }),
});

export const { useInitializeUserMutation, useGetUserQuery, useGetUserReferralListQuery } = userApi;
