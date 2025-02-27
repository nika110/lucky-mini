import { ApiResponse } from "@/types/api";
import { api } from "./api";
import { ConfigApp, CurrentRaffle, GAME_TYPE } from "@/types/raffle";

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
      { token: string; telegram_id: string; gameType: GAME_TYPE }
    >({
      query: ({
        // token,x
        telegram_id,
        gameType,
      }) => ({
        url: `/users/${telegram_id}/current-raffle`,
        method: "POST",
        body: {
          gameType,
        },
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
