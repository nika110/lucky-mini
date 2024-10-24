import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { TonConnectProvider } from "./components/features/providers/TonWallet.provider";
import { SolanaWalletProvider } from "./components/features/providers/SolWallet.provider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const App = () => {
  return (
    <>
      <TonConnectProvider
        botName={import.meta.env.VITE_BOT_NAME || ""}
        webAppName={import.meta.env.VITE_WEB_APP_NAME || ""}
      >
        <SolanaWalletProvider
          network={WalletAdapterNetwork.Mainnet}
          autoConnect
        >
          <RouterProvider router={router} />
        </SolanaWalletProvider>
      </TonConnectProvider>
    </>
  );
};

export default App;
