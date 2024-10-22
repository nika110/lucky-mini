import { useState, useEffect } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { Connection, PublicKey, ConnectionConfig } from "@solana/web3.js";
import { toast } from "react-hot-toast";

//  RPC endpoints
const RPC_ENDPOINTS = [
  // Ankr public RPC
  "https://rpc.ankr.com/solana",

  // RunNode public RPC
  "https://mainnet.rpcpool.com/",

  // GenesysGo public RPC
  "https://ssc-dao.genesysgo.net/",
];

// RPC
const CONNECTION_CONFIG: ConnectionConfig = {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
  disableRetryOnRateLimit: false,
};

interface WalletState {
  tonAddress: string | null;
  tonBalance: string | null;
  solanaAddress: string | null;
  solanaBalance: string | null;
}

interface SolanaWalletState {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
}

interface PhantomWindow extends Window {
  solana?: {
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    isPhantom?: boolean;
    publicKey: PublicKey | null;
    isConnected: boolean;
    on: (event: string, callback: () => void) => void;
    off: (event: string, callback: () => void) => void;
  };
}

declare const window: PhantomWindow;

const App = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    tonAddress: null,
    tonBalance: null,
    solanaAddress: null,
    solanaBalance: null,
  });

  const [solanaWallet, setSolanaWallet] = useState<SolanaWalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
  });

  // CHECK PHANTOM
  const checkIfPhantomIsInstalled = () => {
    const provider = window.solana;
    if (!provider?.isPhantom) {
      toast.error("Phantom wallet is not installed!");
      return false;
    }
    return true;
  };

  // RETRY WITH DIFF NETSSSSS
  const getSolanaBalance = async (
    publicKey: string
  ): Promise<string | null> => {
    let lastError = null;

    for (const endpoint of RPC_ENDPOINTS) {
      try {
        const connection = new Connection(endpoint, CONNECTION_CONFIG);
        const pubKey = new PublicKey(publicKey);

        // Добавляем небольшую задержку между попытками
        await new Promise((resolve) => setTimeout(resolve, 100));

        const balance = await connection.getBalance(pubKey);
        console.log(`Successfully got balance from ${endpoint}`);
        return (balance / 1e9).toFixed(4);
      } catch (error) {
        console.warn(`Failed to get balance from ${endpoint}:`, error);
        lastError = error;
        continue;
      }
    }

    console.error("All RPC endpoints failed. Last error:", lastError);
    return null;
  };

  // GET WALLET FUNC SOLANA
  const connectSolanaWallet = async () => {
    try {
      if (!checkIfPhantomIsInstalled()) return;

      setSolanaWallet((prev) => ({ ...prev, connecting: true }));

      const provider = window.solana;

      const response = await provider!.connect();
      const publicKey = response.publicKey.toString();

      const balance = await getSolanaBalance(publicKey);

      if (!balance) {
        toast.error("Failed to fetch wallet balance");
      }

      setSolanaWallet({
        publicKey,
        connected: true,
        connecting: false,
      });

      setWalletState((prev) => ({
        ...prev,
        solanaAddress: publicKey,
        solanaBalance: balance,
      }));

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
      setSolanaWallet({
        publicKey: null,
        connected: false,
        connecting: false,
      });
    }
  };

  // SOLANA CHECK FUNC
  const disconnectSolanaWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
      }

      setSolanaWallet({
        publicKey: null,
        connected: false,
        connecting: false,
      });

      setWalletState((prev) => ({
        ...prev,
        solanaAddress: null,
        solanaBalance: null,
      }));

      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  useEffect(() => {
    if (window.solana) {
      const handleConnect = async () => {
        if (window.solana?.publicKey) {
          const publicKey = window.solana.publicKey.toString();
          const balance = await getSolanaBalance(publicKey);

          setSolanaWallet((prev) => ({
            ...prev,
            publicKey,
            connected: true,
          }));

          if (balance) {
            setWalletState((prev) => ({
              ...prev,
              solanaAddress: publicKey,
              solanaBalance: balance,
            }));
          }
        }
      };

      const handleDisconnect = () => {
        setSolanaWallet({
          publicKey: null,
          connected: false,
          connecting: false,
        });
        setWalletState((prev) => ({
          ...prev,
          solanaAddress: null,
          solanaBalance: null,
        }));
      };

      window.solana.on("connect", handleConnect);
      window.solana.on("disconnect", handleDisconnect);

      // Проверяем начальное состояние
      if (window.solana.isConnected && window.solana.publicKey) {
        handleConnect();
      }

      return () => {
        window.solana?.off("connect", handleConnect);
        window.solana?.off("disconnect", handleDisconnect);
      };
    }
  }, []);

  useEffect(() => {
    if (!solanaWallet.connected || !solanaWallet.publicKey) return;

    const updateBalance = async () => {
      const balance = await getSolanaBalance(solanaWallet.publicKey!);
      if (balance) {
        setWalletState((prev) => ({
          ...prev,
          solanaBalance: balance,
        }));
      }
    };

    const interval = setInterval(updateBalance, 30000); // reload every 30 secs

    return () => clearInterval(interval);
  }, [solanaWallet.connected, solanaWallet.publicKey]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">$lucky Platform</h1>

        {/* TON Wallet Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">TON Wallet</h2>
          <div className="space-y-4">
            <TonConnectButton />

            {walletState.tonAddress && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-semibold">Address:</span>{" "}
                  {walletState.tonAddress}
                </p>
                <p>
                  <span className="font-semibold">Balance:</span>{" "}
                  {walletState.tonBalance} TON
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Solana Wallet Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Solana Wallet</h2>
          <div className="space-y-4">
            {!solanaWallet.connected ? (
              <button
                onClick={connectSolanaWallet}
                disabled={solanaWallet.connecting}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
              >
                {solanaWallet.connecting
                  ? "Connecting..."
                  : "Connect Solana Wallet"}
              </button>
            ) : (
              <button
                onClick={disconnectSolanaWallet}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Disconnect
              </button>
            )}

            {walletState.solanaAddress && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-semibold">Address:</span>{" "}
                  {walletState.solanaAddress}
                </p>
                <p>
                  <span className="font-semibold">Balance:</span>{" "}
                  {walletState.solanaBalance} SOL
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
