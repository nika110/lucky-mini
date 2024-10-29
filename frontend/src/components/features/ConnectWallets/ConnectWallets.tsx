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
// import { box } from "tweetnacl";
// import bs58 from "bs58";

import {
  useTonConnectModal,
  useTonWallet,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { ROUTES } from "@/routes/routes";
import { useGetSolWalletMutation } from "@/redux/services/wallet.api";
import { LOCAL_STORAGE_KEYS } from "@/utils/localStorage";
import { DEEP_LINKS } from "@/utils/phantom";

const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_BOT_NAME;
const TELEGRAM_MINI_APP_NAME = import.meta.env.VITE_WEB_APP_NAME;

const APP_CONFIG = {
  name: "Your App Name",
  icon: `${import.meta.env.VITE_APP_URL}/icon.png`,
  url: import.meta.env.VITE_APP_URL,
};

const ConnectWallets: FC = () => {
  const isInitLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.TG_INIT_USER);
  const [isOpenSelect, setIsOpenSelect] = useState(false);

  const wallet = null;

  // mutations

  const [getSolanaWallet] = useGetSolWalletMutation();

  const handleSolConnect = () => {
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      // alert(userId);

      if (isInitLocal && userId) {
        getSolanaWallet({ telegramId: userId.toString() })
          .unwrap()
          .then((res) => {
            if (res.data) {
              if ("success" in res && res.success) {
                const { server_public_key } = res.data.walletData;
                const redirectUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_MINI_APP_NAME}`;
                const phantomUrl = new URL(DEEP_LINKS.CONNECT);

                // SET URL INFORMATION
                phantomUrl.searchParams.set("app_url", APP_CONFIG.url);
                phantomUrl.searchParams.set(
                  "dapp_encryption_public_key",
                  server_public_key
                );
                phantomUrl.searchParams.set(
                  "redirect_link",
                  `${APP_CONFIG.url}${
                    ROUTES.CONNECT_SOL
                  }/?userId=${userId!.toString()}&appUrl=${redirectUrl}&app_encryption_public_key=${server_public_key}`
                );

                // LINKING
                const isTelegramMobileApp =
                  window.Telegram?.WebApp?.platform !== "web";
                if (isTelegramMobileApp) {
                  window.Telegram?.WebApp?.openLink(phantomUrl.toString(), {
                    try_instant_view: false,
                  });
                }
              }
            }
          });
      }
    } catch (error) {
      console.error("Error connecting to Phantom:", error);
    }
  };

  const handleDisconnectSolWallet = () => {
    console.log("disconnect");
  };

  // TON wallet logic
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
      ) : wallet ? (
        <p
          className="max-w-[100px] truncate text-sm uppercase"
          onClick={handleDisconnectSolWallet}
        >
          {wallet}
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
