import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { TonConnectProvider } from "./components/features/providers/TonWallet.provider";
// import { SolanaWalletProvider } from "./components/features/providers/SolWallet.provider";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import eruda from "eruda";
eruda.init();

const App = () => {
  return (
    <>
      <TonConnectProvider
        botName={import.meta.env.VITE_BOT_NAME || ""}
        webAppName={import.meta.env.VITE_WEB_APP_NAME || ""}
      >
        {/* <SolanaWalletProvider
          network={WalletAdapterNetwork.Mainnet}
          autoConnect
        > */}
          <Provider store={store}>
            <RouterProvider router={router} />
          </Provider>
        {/* </SolanaWalletProvider> */}
      </TonConnectProvider>
    </>
  );
};

export default App;
