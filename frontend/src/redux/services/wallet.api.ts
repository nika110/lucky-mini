import { api } from "./api";
import { InitSignMessage, SolanaWallet } from "@/types/wallet";
import { ApiResponse } from "@/types/api";

export const walletApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSolWallet: build.mutation<
      ApiResponse<SolanaWallet>,
      { telegramId: string }
    >({
      query: ({ telegramId }) => ({
        url: `/users/${telegramId}/sol-wallet`,
        method: "GET",
      }),
      invalidatesTags: ["Wallet"],
    }),
    connectWallet: build.mutation<
      ApiResponse<SolanaWallet>,
      {
        telegramId: string;
        phantom_encryption_public_key: string;
        nonce: string;
        data: string;
      }
    >({
      query: ({ telegramId, ...body }) => ({
        url: `/users/${telegramId}/connect-wallet`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),
    initializeSignMessage: build.mutation<
      ApiResponse<InitSignMessage>,
      {
        telegramId: string;
      }
    >({
      query: ({ telegramId }) => ({
        url: `/users/${telegramId}/init-signature`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSolWalletMutation,
  useConnectWalletMutation,
  useInitializeSignMessageMutation,
} = walletApi;
