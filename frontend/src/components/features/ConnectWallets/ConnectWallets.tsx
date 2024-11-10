import { FC, useState } from "react";
import { Button } from "@/components/shared/UI/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/shared/UI/drawerCustom";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import cl from "./ConnectWallets.module.css";
import { SOLHugeIcon } from "@/components/shared/UI/Icons/SOLHuge";
import { TONHuge } from "@/components/shared/UI/Icons/TONHuge";
import {
  useTonConnectModal,
  // useTonWallet,
  // useTonConnectUI,
} from "@tonconnect/ui-react";
// import { ROUTES } from "@/routes/routes";
// import { useInitiWalletMutation } from "@/redux/services/wallet.api";
import { LOCAL_STORAGE_KEYS } from "@/utils/localStorage";
// import { DEEP_LINKS } from "@/utils/phantom";
// import { BLOCKCHAINS, SolanaWalletData } from "@/types/wallet";

// const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_BOT_NAME;
// const TELEGRAM_MINI_APP_NAME = import.meta.env.VITE_WEB_APP_NAME;

// const APP_CONFIG = {
//   name: "Your App Name",
//   icon: `${import.meta.env.VITE_APP_URL}/icon.png`,
//   url: import.meta.env.VITE_APP_URL,
// };

const ConnectWallets: FC = () => {
  const isInitLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.TG_INIT_USER);
  const [isOpenSelect, setIsOpenSelect] = useState(false);

  // const [initiWallet] = useInitiWalletMutation();

  const handleSolConnect = () => {
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (isInitLocal && userId) {
        // initiWallet({
        //   telegramId: userId.toString(),
        //   walletType: BLOCKCHAINS.SOL,
        // })
        //   .unwrap()
        //   .then((res) => {
        //     if (res.data) {
        //       if ("success" in res && res.success) {
        //         const { server_public_key } = res.data
        //           .walletData as SolanaWalletData;
        //         const redirectUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_MINI_APP_NAME}`;
        //         const phantomUrl = new URL(DEEP_LINKS.CONNECT);
        //         // SET URL INFORMATION
        //         phantomUrl.searchParams.set("app_url", APP_CONFIG.url);
        //         phantomUrl.searchParams.set(
        //           "dapp_encryption_public_key",
        //           server_public_key
        //         );
        //         phantomUrl.searchParams.set(
        //           "redirect_link",
        //           `${APP_CONFIG.url}${
        //             ROUTES.CONNECT_SOL
        //           }/?userId=${userId!.toString()}&appUrl=${redirectUrl}&app_encryption_public_key=${server_public_key}`
        //         );
        //         // LINKING
        //         const isTelegramMobileApp =
        //           window.Telegram?.WebApp?.platform !== "web";
        //         if (isTelegramMobileApp) {
        //           window.Telegram?.WebApp?.openLink(phantomUrl.toString(), {
        //             try_instant_view: false,
        //           });
        //         }
        //       } else {
        //         alert("SMTH WENT WRONG");
        //       }
        //     } else {
        //       alert("SMTH WENT WRONG");
        //     }
        //   });
      }
    } catch (error) {
      console.error("Error connecting to Phantom:", error);
    }
  };

  // TON wallet logic

  // const [tonConnectUI] = useTonConnectUI();
  const { open: openTonConnect } = useTonConnectModal();

  const handleTonConnect = () => {
    openTonConnect();
    setIsOpenSelect(false);
  };

  // const handleDisconnectTonWallet = async () => {
  //   await tonConnectUI.disconnect();
  // };

  return (
    <div>
      <Drawer
        isOpen={isOpenSelect}
        onClose={() => setIsOpenSelect(false)}
        onOpen={() => setIsOpenSelect(true)}
      >
        <DrawerTrigger>
          <Button>Connect Wallet</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="pb-20">
            <h2 className="text-center text-base leading-5 uppercase mx-auto mb-4 max-w-[260px]">
              Connect via one of these wallets
            </h2>
            <div className={`gap-4 ${cl.selectType}`}>
              <div className="relative">
                <div className="absolute text-center h-[15px] z-10 text-lg leading-none left-0 right-0 bottom-0 top-0 m-auto">
                  SOON
                </div>
                <button
                  className="relative flex flex-col justify-center h-full pt-7 items-center gap-3 px-7 opacity-30"
                  onClick={handleSolConnect}
                >
                  <PixelWrapper color="gray" width={2} />
                  <SOLHugeIcon />
                  <p className="text-center text-lg uppercase">SOL</p>
                </button>
              </div>

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
    </div>
  );
};

export default ConnectWallets;
