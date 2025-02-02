import { FC, useEffect, useState } from "react";
import cl from "./Navbar.module.css";
import { ROUTES } from "@/routes/routes";
import { HomeIcon } from "@/components/shared/UI/Icons/HomeIcon";
import { Link, useLocation } from "react-router-dom";
import { FrensIcon } from "@/components/shared/UI/Icons/FrensIcon";
import { WalletIcon } from "@/components/shared/UI/Icons/WalletIcon";
import { useTonWallet } from "@tonconnect/ui-react";
import { useUpdateWalletMutation } from "@/redux/services/wallet.api";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { GamesIcon } from "@/components/shared/UI/Icons/GamesIcon";
import { GamesActiveIcon } from "@/components/shared/UI/Icons/GamesActiveIcon";

interface NavbarLink {
  route: string;
  title: string;
  active?: boolean;
  icon: JSX.Element;
  iconActive: JSX.Element;
}

const navbarLinks: NavbarLink[] = [
  {
    route: ROUTES.HOME,
    title: "Home",
    icon: <HomeIcon color="gray" />,
    iconActive: <HomeIcon color="white" />,
  },
  {
    route: ROUTES.GAMES,
    title: "Games",
    icon: <GamesIcon />,
    iconActive: <GamesActiveIcon />,
  },
  {
    route: ROUTES.REFERRAL,
    title: "Frens",
    icon: <FrensIcon color="gray" />,
    iconActive: <FrensIcon color="white" />,
  },
  {
    route: ROUTES.WALLET,
    title: "WAllet",
    icon: <WalletIcon color="gray" />,
    iconActive: <WalletIcon color="white" />,
  },
];

const Navbar: FC = () => {
  const pathname = useLocation();
  const defaultItem = navbarLinks
    .map((link) => link.route)
    .indexOf(pathname.pathname);

  const { user } = useTelegramUser();

  const [activeItem, setActiveItem] = useState<number>(defaultItem);
  const tonWallet = useTonWallet();

  const [updateTonWallet] = useUpdateWalletMutation();

  useEffect(() => {
    if (tonWallet && user) {
      // USING ADDRES FOR NOW
      const tonPublicKey = tonWallet.account.address;
      console.log("TON PUBLIC", tonPublicKey, user.ton_public_key);

      if (tonPublicKey && tonPublicKey !== user.ton_public_key) {
        // console.log("TON PUBLIC", tonPublicKey);
        updateTonWallet({
          tonPublicKey,
          telegramId: user.telegram_id,
        })
      }
    }
  }, [tonWallet, updateTonWallet, user]);

  return (
    <>
      <div className="h-[35px]"></div>
      <div
        id="navbar"
        className={`sticky z-[49] left-0 right-0 top-[-100%] bottom-10 shadow-[0px_-10px_20px_0_rgba(0,0,0,0.4)] flex flex-nowrap items-center justify-center bg-inkwell h-[71px] w-[calc(100%-32px)] mx-auto ${cl.navbar}`}
      >
        <PixelWrapperNavbar />
        <nav className="flex justify-around w-full items-end pb-1.5 px-3">
          {navbarLinks.map((link, i) => (
            <Link
              to={link.route}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300`}
              onClick={() =>
                setActiveItem(
                  navbarLinks.findIndex((e) => e.route === link.route)
                )
              }
              id={link.route}
            >
              {activeItem === i ? link.iconActive : link.icon}
              <span
                className={`text-sm uppercase leading-none ${
                  activeItem === i ? "text-white" : "text-magnet"
                }`}
              >
                {link.title}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

const PixelWrapperNavbar: FC = () => (
  <div className="w-full h-full pointer-events-none absolute">
    {/* LINES */}
    <div
      className={`absolute left-[-3px] bottom-0 right-auto m-auto top-0 h-[calc(100%-6px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-[-3px] bottom-auto left-auto m-auto top-[3px] h-[calc(100%+3px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-[-6px] bottom-auto left-auto m-auto top-[9px] h-[calc(100%-6px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-[-9px] bottom-auto left-auto m-auto top-[12px] h-[calc(100%-12px)] w-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-0 bottom-auto right-0 m-auto top-[-3px] w-[calc(100%-6px)] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-0 top-auto right-0 m-auto bottom-[-3px] w-full h-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-[3px] top-auto right-0 m-auto bottom-[-6px] w-[calc(100%-3px)] h-[3px] bg-liquor`}
    />
    {/* CORNERS */}
    <div
      className={`absolute left-0 bottom-auto right-auto m-auto top-0 w-[3px] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-0 bottom-auto left-auto m-auto top-0 w-[3px] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute right-0 top-auto left-auto m-auto bottom-0 w-[3px] h-[3px] bg-liquor`}
    />
    <div
      className={`absolute left-0 top-auto right-auto m-auto bottom-0 w-[3px] h-[3px] bg-liquor`}
    />
  </div>
);

export default Navbar;
