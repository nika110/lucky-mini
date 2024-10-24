import { FC, useState } from "react";
import { Button } from "@/components/shared/UI/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/shared/UI/drawer";

import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import cl from "./ConnectWallets.module.css";
import { SOLHugeIcon } from "@/components/shared/UI/Icons/SOLHuge";
import { TONHuge } from "@/components/shared/UI/Icons/TONHuge";

import {
  useTonConnectModal,
  useTonWallet,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
const ConnectWallets: FC = () => {
  const [isOpenSelect, setIsOpenSelect] = useState(false);

  // SOL
  const { setVisible } = useWalletModal();
  const { wallet, disconnect, publicKey } = useWallet();

  const handleSolConnect = () => {
    setVisible(true);
    setIsOpenSelect(false);
  };

  const handleDisconnectSolWallet = async () => {
    disconnect();
  };

  // TON
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { open: openTonConnect } = useTonConnectModal();

  const handleTonConnect = () => {
    openTonConnect();
    setIsOpenSelect(false);
  };

  const handleDisconnectTonWallet = async () => {
    await tonConnectUI.disconnect();
  };

  return (
    <div>
      {tonWallet ? (
        <p
          className="max-w-[100px] truncate text-sm uppercase"
          onClick={handleDisconnectTonWallet}
        >
          {tonWallet.account.address}
        </p>
      ) : wallet && publicKey ? (
        <p
          className="max-w-[100px] truncate text-sm uppercase"
          onClick={handleDisconnectSolWallet}
        >
          {publicKey + ""}
        </p>
      ) : (
        <Drawer open={isOpenSelect} onOpenChange={setIsOpenSelect}>
          <DrawerTrigger>
            <Button>Connect Wallet</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="pb-20">
              <h2 className="text-center text-base leading-5 uppercase mx-auto mb-4 max-w-[260px]">
                Connect via one of these wallets
              </h2>
              <div className={`gap-4 ${cl.selectType}`}>
                <button
                  className="relative flex flex-col justify-center h-full pt-7 items-center gap-3 px-7"
                  onClick={handleSolConnect}
                >
                  <PixelWrapper color="gray" width={2} />
                  <SOLHugeIcon />
                  <p className="text-center text-lg uppercase">SOL</p>
                </button>
                <button
                  className="relative flex flex-col justify-center h-full pt-7 items-center gap-3 px-7"
                  onClick={handleTonConnect}
                >
                  <PixelWrapper color="gray" width={2} />
                  <TONHuge />
                  <p className="text-center text-lg uppercase">TON</p>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default ConnectWallets;
