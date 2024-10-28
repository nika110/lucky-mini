import { User } from "@/types/user";
import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    initializeUser: build.mutation<
      User,
      { referralCode?: string; username?: string; telegramId: string }
    >({
      query: (body) => ({
        url: "/users/initialize",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["User"],
    }),
    getUser: build.query<User, string>({
      query: (telegramId) => ({
        url: `users/${telegramId}`,
      }),
    }),
  }),
});

export const { useInitializeUserMutation, useGetUserQuery } = userApi;
