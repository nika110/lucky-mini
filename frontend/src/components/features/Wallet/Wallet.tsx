import { FC, useLayoutEffect, useRef, useState } from "react";
import ConnectWallets from "../ConnectWallets/ConnectWallets";
import {
  useTonConnectUI,
  useTonWallet,
  Wallet as ITonWallet,
} from "@tonconnect/ui-react";
import { Button } from "@/components/shared/UI/button";
import { formatWalletAddress } from "@/helpers/shortWalletAddress";
import { TonFilled } from "@/components/shared/UI/Icons/TonFilled";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/shared/UI/drawerCustom";
import { ArrowDown } from "@/components/shared/UI/Icons/ArrowDown";
import { Card } from "@/components/shared/UI/card";
import { ActiveIcon } from "@/components/shared/UI/Icons/ActiveIcon";

import { useTelegramUser } from "@/hooks/useTelegramUser";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import { useUpdateWalletMutation } from "@/redux/services/wallet.api";
import { toast } from "sonner";
import gsap from "gsap";
import { ClockIcon } from "@/components/shared/UI/Icons/ClockIcon";
import { LeadersWIcon } from "@/components/shared/UI/Icons/LeadersWIcon";
import { ShopIcon } from "@/components/shared/UI/Icons/ShopIcon";
import { WWWIcon } from "@/components/shared/UI/Icons/WwwIcon";
import { TgUser, User } from "@/types/user";
import SoonModal from "@/components/shared/Modals/SoonModal";
import { useAppDispatch } from "@/redux/store";
import { MODALS, toggleModal } from "@/redux/features/modals.reducer";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { XPIcon } from "@/components/shared/UI/Icons/XPIcon";

const Wallet: FC = () => {
  const { user, isSuccess: isSuccessUser, isLoading } = useTelegramUser();

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const tonWallet = useTonWallet();

  const isWalletExist = user && user.ton_public_key !== "" && tonWallet;

  return (
    <section className={"min-h-[80svh]"}>
      {isWalletExist && isSuccessUser && tgUser && user ? (
        <WalletComp tonWallet={tonWallet} tgUser={tgUser} user={user} />
      ) : null}
      {!isLoading && !isWalletExist && isSuccessUser && user ? (
        <WalletExistance />
      ) : null}
      {isLoading ? (
        <div
          key={"wallet_loading"}
          className="h-[85lvh] flex justify-center items-center"
        >
          <CubesLoading />
        </div>
      ) : null}
    </section>
  );
};

interface WalletCompProps {
  tonWallet: ITonWallet;
  tgUser: TgUser;
  user: User;
}

export const WalletComp: FC<WalletCompProps> = ({
  tonWallet,
  tgUser,
  user,
}) => {
  const dispatch = useAppDispatch();
  const walletRef = useRef<HTMLDivElement>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const [updateTonWallet] = useUpdateWalletMutation();

  const [tonConnectUI] = useTonConnectUI();

  const handleDisconnectTonWallet = async () => {
    if (user?.ton_public_key) {
      updateTonWallet({
        tonPublicKey: "",
        telegramId: user.telegram_id,
      })
        .unwrap()
        .catch(() => {
          toast.error(
            "Failed to connect your wallet to our service please try again later!"
          );
        });
    }
    await tonConnectUI.disconnect();
    setIsOpenDrawer(false);
  };

  const handleComingSoon = () => {
    dispatch(toggleModal({ key: MODALS.SOON, value: true }));
  };

  useLayoutEffect(() => {
    if (walletRef.current) {
      const walletBlock = walletRef.current;
      const ctx = gsap.context(() => {
        const tokensItems = gsap.utils.toArray(
          walletBlock.querySelectorAll("#walletTokens")
        ) as HTMLElement[];
        tokensItems.forEach((item, index) => {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              delay: index * 0.1 + 0.15,
              ease: "power4.inOut",
            }
          );
        });

        gsap.fromTo(
          walletBlock.querySelector("#walletBanner"),
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            delay: 0.2,
            ease: "easeInOut",
          }
        );
      });

      return () => ctx.revert();
    }
  }, [walletRef]);

  return (
    <div className="relative" ref={walletRef}>
      <SoonModal />
      <div className="container mt-8 mb-12 flex justify-between items-center">
        <div>
          <Drawer
            isOpen={isOpenDrawer}
            onClose={() => setIsOpenDrawer(false)}
            onOpen={() => setIsOpenDrawer(true)}
          >
            <DrawerTrigger>
              <Button variant={"ghost"}>
                <div className="flex justify-center items-center gap-2">
                  <TonFilled />
                  <span className="uppercase text-[10px] text-white">
                    {formatWalletAddress(tonWallet.account.address)}
                  </span>
                  <span>
                    <ArrowDown className="!w-[11px] !h-[11px] object-contain" />
                  </span>
                </div>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="pb-10 px-5">
                <DrawerTitle className="mb-10">Wallet</DrawerTitle>
                <Card
                  variant={"ghost"}
                  className="flex justify-between items-center px-4 h-14"
                >
                  <span className="uppercase text-base text-white">
                    {formatWalletAddress(tonWallet.account.address, 5)}
                  </span>
                  <p className="flex justify-end items-center gap-1.5">
                    <ActiveIcon className="!w-4 !h-4" />
                    <span className="text-[#37EE26] text-base uppercase">
                      Active
                    </span>
                  </p>
                </Card>
                <div className="flex mt-8 justify-center items-center">
                  <Button
                    onClick={() => {
                      handleDisconnectTonWallet();
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="flex justify-end items-center gap-2.5">
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-base uppercase max-w-[115px] truncate leading-none">
              {tgUser.first_name + " " + tgUser.last_name}
            </p>
            <span className="text-rock text-sm max-w-[115px] truncate">
              @{tgUser.username}
            </span>
          </div>
          <img src="/user.svg" className="w-12 h-12" />
        </div>
      </div>
      <div className="container">
        {/* Balance */}
        <div className="flex flex-col justify-center items-center gap-4 mb-10">
          <span className="text-lg text-rock leading-none uppercase text-center">
            balance:
          </span>
          <p className="flex justify-center items-center gap-3 text-2xl leading-none">
            {user.xp || 0} <XPIcon className="!w-[26px] !h-[26px]" />
          </p>
        </div>
        {/* Action buttons */}
        <ul className="flex justify-around items-center px-[2vw]">
          <li className="flex flex-col justify-center items-center gap-3">
            <Button size={"rounded"} onClick={handleComingSoon}>
              <LeadersWIcon className="!w-[22px] !h-[22px]" />
            </Button>
            <span className="text-white uppercase text-[2.42vw] leading-none">
              Leaders
            </span>
          </li>
          <li className="flex flex-col justify-center items-center gap-3">
            <Button size={"rounded"} onClick={handleComingSoon}>
              <ClockIcon className="!w-[22px] !h-[22px]" />
            </Button>
            <span className="text-white uppercase text-[2.42vw] leading-none">
              HISTORY
            </span>
          </li>
          <li className="flex flex-col justify-center items-center gap-3">
            <Button size={"rounded"} onClick={handleComingSoon}>
              <ShopIcon className="!w-[22px] !h-[22px]" />
            </Button>
            <span className="text-white uppercase text-[2.42vw] leading-none">
              Shop
            </span>
          </li>
          <li className="flex flex-col justify-center items-center gap-3">
            <Button size={"rounded"} onClick={handleComingSoon}>
              <WWWIcon className="!w-[22px] !h-[22px]" />
            </Button>
            <span className="text-white uppercase text-[2.42vw] leading-none">
              Links
            </span>
          </li>
        </ul>
        {/* Banner */}
        <div
          id="walletBanner"
          className="relative flex justify-start bg-inkwell items-center mt-8 mb-7 gap-4 py-3 px-5"
        >
          <PixelWrapper width={3} color={"gray"} />
          <div className="flex shrink-0 justify-center items-center">
            <TonFilled className="!w-8 !h-8" />
          </div>
          <p className="text-[10px] uppercase leading-4">
            Only TON CoinS are shown!
            <br />
            Other COINS will be added soon!
          </p>
        </div>
        {/* Tokens */}
        <ul className="grid grid-cols-1 gap-3.5">
          <TonWalletInfo address={tonWallet.account.address} />
        </ul>
      </div>
    </div>
  );
};

interface WalletProps {
  address: string;
}

const TonWalletInfo: FC<WalletProps> = ({ address }) => {
  const { balance, loading, error } = useWalletBalance(address);

  return (
    <li id="walletTokens" className="flex justify-between items-center">
      <div className="flex justify-start items-center gap-3.5">
        <TonFilled className="!w-[50px] !h-[50px]" />
        <div className="flex flex-col gap-1 ">
          <span className="text-base leading-none uppercase">Toncoin</span>
        </div>
      </div>
      <p className="flex justify-end items-center gap-1.5 text-lg leading-none uppercase text-end">
        {!loading && balance && !error ? balance : "..."}{" "}
        <TonFilled className="!w-4 !h-4" />
      </p>
    </li>
  );
};

const WalletExistance: FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          element.querySelector("#walletExistanceImage"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power4.inOut" }
        );

        gsap.fromTo(
          element.querySelector("#walletExistanceTitle"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.05, ease: "power4.inOut" }
        );

        gsap.fromTo(
          element.querySelector("#walletExistanceButton"),
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.1,
            ease: "power4.inOut",
          }
        );
      });
      return () => ctx.revert();
    }
  }, []);

  return (
    <div
      ref={ref}
      className="pt-[20svh] flex justify-center items-center flex-col gap-5"
    >
      <img
        id="walletExistanceImage"
        src="/wallet.svg"
        className="w-[85px] h-[85px] object-contain shrink-0"
      />
      <h2
        id="walletExistanceTitle"
        className="text-center text-lg leading-[19px] px-5"
      >
        Connect TON or Solana wallet to start your journey.
      </h2>
      <div id="walletExistanceButton" className="flex justify-center">
        <ConnectWallets />
      </div>
    </div>
  );
};

export default Wallet;
