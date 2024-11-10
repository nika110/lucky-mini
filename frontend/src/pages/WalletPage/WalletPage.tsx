import Navbar from "@/components/features/Navbar/Navbar";
import Wallet from "@/components/features/Wallet/Wallet";
import { FC } from "react";
// import cl from "./WalletPage.module.css";

const WalletPage: FC = () => {
  return (
    <div>
      <Wallet />
      <Navbar />
    </div>
  );
};

export default WalletPage;
