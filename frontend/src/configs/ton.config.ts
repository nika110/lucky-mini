export const TON_CONFIG = {
  manifestUrl: import.meta.env.VITE_TON_MANIFEST_URL,
  bridgeUrl: "https://bridge.tonapi.io/bridge",
  universalUrl: "ton://connect",
  endpoints: {
    mainnet: import.meta.env.VITE_TON_MAINNET_ENDPOINT,
    testnet: import.meta.env.VITE_TON_TESTNET_ENDPOINT,
  },
} as const;
