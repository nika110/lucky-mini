// import { useGetWalletQuery } from "@/redux/services/wallet.api";
import { FC } from "react";
import ConnectWallets from "../ConnectWallets/ConnectWallets";
import { useTonWallet } from "@tonconnect/ui-react";

const Wallet: FC = () => {
  // const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  // const { data: wallet, isSuccess } = useGetWalletQuery(
  //   {
  //     telegramId: userId + "",
  //   },
  //   {
  //     skip: !userId,
  //   }
  // );

  const tonWallet = useTonWallet();

  const isWalletExist = tonWallet;

  return (
    <section className={"min-h-[80svh]"}>
      <div className="container">
        {isWalletExist ? (
          <div className="">wallet</div>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default Wallet;
