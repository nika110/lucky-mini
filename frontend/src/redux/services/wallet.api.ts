import { api } from "./api";
import {
  BLOCKCHAINS,
  InitSignMessage,
  SolanaWallet,
  Wallet,
} from "@/types/wallet";
import { ApiResponse } from "@/types/api";

export const walletApi = api.injectEndpoints({
  endpoints: (build) => ({
    initiWallet: build.mutation<
      ApiResponse<Wallet>,
      { telegramId: string; walletType: BLOCKCHAINS }
    >({
      query: ({ telegramId, walletType }) => ({
        url: `/users/${telegramId}/init-wallet`,
        method: "POST",
        body: {
          walletType,
        },
      }),
      invalidatesTags: ["Wallet"],
    }),
    getWallet: build.query<ApiResponse<Wallet>, { telegramId: string }>({
      query: ({ telegramId }) => ({
        url: `/users/${telegramId}/wallet`,
        method: "GET",
      }),
      providesTags: ["Wallet"],
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
    signMessage: build.mutation<
      ApiResponse<null>,
      {
        telegramId: string;
        data: string;
        nonce: string;
      }
    >({
      query: ({ telegramId, ...body }) => ({
        url: `/users/${telegramId}/sign-message`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSignMessageMutation,
  useInitiWalletMutation,
  useGetWalletQuery,
  useConnectWalletMutation,
  useInitializeSignMessageMutation,
} = walletApi;
