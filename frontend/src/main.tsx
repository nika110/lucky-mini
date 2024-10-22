import React from "react";
import ReactDOM from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "@/styles/index.css";

// Конфигурация для TON Connect
const manifestUrl = "http://localhost:5173/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
      <Toaster position="bottom-center" />
    </TonConnectUIProvider>
  </React.StrictMode>
);
