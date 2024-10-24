import { api } from "./api";

// API
export const userApi = api.injectEndpoints({
  // endpoints: (build) => ({
  endpoints: () => ({
    // getUser: build.mutation<unknown, void>({
    //   query: (body) => ({
    //     url: "wallets/connect",
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: [],
    // }),
  }),
  overrideExisting: false,
});

// export const {} = userApi;
