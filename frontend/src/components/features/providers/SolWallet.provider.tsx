// import { FC, PropsWithChildren, useMemo } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl } from "@solana/web3.js";

// import "@solana/wallet-adapter-react-ui/styles.css";

// interface SolanaWalletProviderProps extends PropsWithChildren {
//   network?: WalletAdapterNetwork;
//   autoConnect?: boolean;
// }

// const DEFAULT_NETWORK = WalletAdapterNetwork.Devnet;

// export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({
//   children,
//   network = DEFAULT_NETWORK,
//   autoConnect = true,
// }) => {
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);

//   const wallets = useMemo(
//     () => [
//       /**
//        * Automatically supported wallet standards:
//        * - Solana Mobile Stack Mobile Wallet Adapter Protocol
//        * - Solana Wallet Standard
//        *
//        * For legacy wallets, add them here.
//        * Common legacy adapters: @solana/wallet-adapter-wallets
//        */
//       new UnsafeBurnerWalletAdapter(),
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [network]
//   );

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect={autoConnect}>
//         <WalletModalProvider>{children}</WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };
