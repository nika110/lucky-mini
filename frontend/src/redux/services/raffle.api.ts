import { ApiResponse } from "@/types/api";
import { api } from "./api";
import { ConfigApp, CurrentRaffle } from "@/types/raffle";

export const raffleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getConfig: build.query<ApiResponse<ConfigApp>, { telegram_id: string }>({
      query: ({ telegram_id }) => ({
        url: `/users/${telegram_id}/config`,
        method: "GET",
      }),
    }),
    getCurrentRaffle: build.query<
      ApiResponse<CurrentRaffle>,
      { token: string; telegram_id: string }
    >({
      query: ({
        // token,x
        telegram_id,
      }) => ({
        url: `/users/${telegram_id}/current-raffle`,
        method: "GET",
      }),
    }),
    increaseXP: build.mutation<
      ApiResponse<null | boolean>,
      { telegramId: string; xp: number }
    >({
      query: ({ telegramId, xp }) => ({
        url: `/users/${telegramId}/increase-xp`,
        method: "POST",
        body: {
          xp,
        },
      }),
    }),
  }),
});

export const {
  useGetConfigQuery,
  useGetCurrentRaffleQuery,
  useIncreaseXPMutation,
} = raffleApi;
