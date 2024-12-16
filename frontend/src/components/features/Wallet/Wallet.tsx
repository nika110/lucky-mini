import { FC, useState } from "react";
import ConnectWallets from "../ConnectWallets/ConnectWallets";
import {
  // CHAIN,
  useTonConnectUI,
  useTonWallet,
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
import {
  //  AnimatePresence,
  motion,
} from "framer-motion";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { TicketIcon } from "@/components/shared/UI/Icons/TicketIcon";
import CubesLoading from "@/components/shared/Loading/CubesLoading";
// import { DepositIcon } from "@/components/shared/UI/Icons/DepositIcon";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
// import { WithdrawIcon } from "@/components/shared/UI/Icons/WithdrawIcon";
// import { BlackTockens } from "@/components/shared/UI/Icons/BlackTockens";
// import { ClockIcon } from "@/components/shared/UI/Icons/ClockIcon";
import {
  // usePurchaseTicketsMutation,
  useUpdateWalletMutation,
} from "@/redux/services/wallet.api";
import { toast } from "sonner";

const Wallet: FC = () => {
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const { user, isSuccess: isSuccessUser, isLoading } = useTelegramUser();

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const isWalletExist = user && user.ton_public_key !== "" && tonWallet;

  const [updateTonWallet] = useUpdateWalletMutation();

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

  // const [purchaseTickets] = usePurchaseTicketsMutation();

  // const depositTrans = async () => {
  //   const ADDRESS = "UQDn5NpxXKx7nPQbv-gewyYS2DdS6MtB6bE6HL2sM32IjVoF";
  //   alert("Deposit to address: " + ADDRESS);
  //   await tonConnectUI
  //     .sendTransaction({
  //       network: CHAIN.TESTNET,
  //       validUntil: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  //       messages: [
  //         {
  //           address: ADDRESS,
  //           amount: "150000000", // 0ю5 TON
  //         },
  //       ],
  //     })
  //     .then((res) => {
  //       // console.log("BOC", res);
  //       // alert(res.boc);
  //       purchaseTickets({
  //         boc: res.boc,
  //         amount: "150000000",
  //         address: tonWallet!.account.address,
  //         telegramId: user!.telegram_id,
  //       })
  //         .unwrap()
  //         .then((resp) => {
  //           alert(resp.message);
  //           alert(JSON.stringify(resp.data));
  //         })
  //         .catch((err) => {
  //           alert(JSON.stringify(err));
  //         });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  return (
    <section className={"min-h-[80svh]"}>
      {/* <AnimatePresence mode="wait"> */}
      {isWalletExist && isSuccessUser && tgUser && user ? (
        <motion.div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // exit={{ opacity: 0 }}
          // transition={{ duration: 0.2 }}
          key={"wallet_page"}
        >
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
                {user.balance || 0}{" "}
                <TicketIcon className="!w-[46px] !h-[26px]" />
              </p>
            </div>
            {/* Action buttons */}
            {/* <ul className="flex justify-around items-center">
              <li className="flex flex-col justify-center items-center gap-3">
                <Button onClick={depositTrans} size={"rounded"}>
                  <DepositIcon className="!w-[22px] !h-[22px]" />
                </Button>
                <span className="text-white uppercase text-[2.42vw] leading-none">
                  DEPOSIT
                </span>
              </li>
              <li className="flex flex-col justify-center items-center gap-3">
                <Button size={"rounded"}>
                  <WithdrawIcon className="!w-[22px] !h-[22px]" />
                </Button>
                <span className="text-white uppercase text-[2.42vw] leading-none">
                  WITHdraw
                </span>
              </li>
              <li className="flex flex-col justify-center items-center gap-3">
                <Button size={"rounded"}>
                  <ClockIcon className="!w-[22px] !h-[22px]" />
                </Button>
                <span className="text-white uppercase text-[2.42vw] leading-none">
                  HISTORY
                </span>
              </li>
              <li className="flex flex-col justify-center items-center gap-3">
                <Button size={"rounded"}>
                  <BlackTockens className="!w-[22px] !h-[22px]" />
                </Button>
                <span className="text-white uppercase text-[2.42vw] leading-none">
                  TOKENS
                </span>
              </li>
            </ul> */}
            {/* Banner */}
            <div className="relative flex justify-start items-center mt-8 mb-7 gap-4 py-3 px-5">
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
              <li className="flex justify-between items-center">
                <div className="flex justify-start items-center gap-3.5">
                  <TonFilled className="!w-[50px] !h-[50px]" />
                  <div className="flex flex-col gap-1 ">
                    <span className="text-base leading-none uppercase">
                      Toncoin
                    </span>
                    <span className="text-[10px] leading-[15px] text-rock">
                      {0} TON
                    </span>
                  </div>
                </div>
                <p className="text-lg leading-none uppercase text-end">$50</p>
              </li>
            </ul>
          </div>
        </motion.div>
      ) : null}{" "}
      {!isLoading && !isWalletExist && isSuccessUser && user ? (
        <motion.div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // exit={{ opacity: 0 }}
          // transition={{ duration: 0.2 }}
          key={"wallet_not_exist"}
        >
          <WalletExistance />
        </motion.div>
      ) : null}
      {isLoading ? (
        <motion.div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.8 } }}
          // transition={{ duration: 0.2 }}
          key={"wallet_loading"}
          className="h-[85lvh] flex justify-center items-center"
        >
          <CubesLoading />
        </motion.div>
      ) : null}
      {/* </AnimatePresence> */}
    </section>
  );
};

const WalletExistance: FC = () => (
  <div className="pt-[20svh] flex justify-center items-center flex-col gap-5">
    <img
      src="/wallet.svg"
      className="w-[85px] h-[85px] object-contain shrink-0"
    />
    <h2 className="text-center text-lg leading-[19px] px-5">
      Connect TON or Solana wallet to start your journey.
    </h2>
    <div className="flex justify-center">
      <ConnectWallets />
    </div>
  </div>
);

export default Wallet;
