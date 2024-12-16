import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { ROUTES } from "@/routes/routes";
import { FC } from "react";
import { Link } from "react-router-dom";
import ConnectWallets from "../ConnectWallets/ConnectWallets";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { Skeleton } from "@/components/shared/UI/skeleton";
// import { useGetWalletQuery } from "@/redux/services/wallet.api";
// import { BLOCKCHAINS, SolanaWalletData } from "@/types/wallet";
import {
  useTonWallet,
  // useTonConnectUI
} from "@tonconnect/ui-react";
import { TicketIcon } from "@/components/shared/UI/Icons/TicketIcon";
import { User } from "@/types/user";
import { PixelWrapper } from "@/components/shared/UI/PixelWrapper/pixelWrapper";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/UI/popover";
import WebApp from "@twa-dev/sdk";

const Header: FC = () => {
  // const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const { user } = useTelegramUser();
  // const { data: wallet, isSuccess } = useGetWalletQuery(
  //   {
  //     telegramId: tgUser!.id! + "",
  //   },
  //   {
  //     skip: !user || !user.telegramId || !tgUser?.id,
  //   }
  // );

  // if (isSuccess && wallet && wallet.data && wallet.data.walletData) {
  //   const walletData = wallet.data.walletData;
  //   if (wallet.data.walletType === BLOCKCHAINS.SOL) {
  //     alert((walletData as SolanaWalletData).signature);
  //   }
  // }

  return (
    <header className={"pt-8"}>
      <div className="container flex justify-between items-center">
        <Link to={ROUTES.HOME}>
          <LogoFull />
        </Link>
        {user ? (
          <HeaderProfile user={user} />
        ) : (
          <Skeleton className="w-[150px] h-9" />
        )}
      </div>
    </header>
  );
};

interface HeaderProfileProps {
  user: User;
}

const HeaderProfile: FC<HeaderProfileProps> = ({ user }) => {
  const tgUser = WebApp.initDataUnsafe.user;
  // const { telegramId } = user;
  // const { data: wallet, isSuccess } = useGetWalletQuery({
  //   telegramId,
  // });

  const tonWallet = useTonWallet();
  // const [tonConnectUI] = useTonConnectUI();
  // const handleDisconnectTonWallet = async () => {
  //   await tonConnectUI.disconnect();
  // };

  const isWalletExist = user && user.ton_public_key !== "" && tonWallet;

  if (
    isWalletExist
    //  || (isSuccess && wallet && wallet.data && wallet.data.walletData)
  ) {
    return (
      <div className="flex justify-end items-center gap-2">
        <div className="relative flex h-[30px] px-2 justify-center bg-inkwell text-base items-center gap-1.5">
          <PixelWrapper width={2} color={"gray"} />
          {user.balance}
          <TicketIcon />
        </div>
        <Popover>
          <PopoverTrigger>
            <img src="/user.svg" className="w-10 h-10" />
          </PopoverTrigger>
          <PopoverContent>
            {tgUser ? (
              <div className="flex justify-start gap-2">
                <div className="flex flex-col gap-1.5">
                  <p className="text-[8px] text-rock leading-none">
                    @{tgUser?.username}
                  </p>
                  <p className="text-base text-white leading-none mb-1">
                    {tgUser.first_name}{" "}
                    {tgUser.last_name ? tgUser.last_name : ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className=""></div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return <ConnectWallets />;
};

export default Header;
