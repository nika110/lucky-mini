import { Layout } from "@/pages/Layout";
import { ROUTES } from "./routes";
import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage/HomePage";
import WalletPage from "@/pages/WalletPage/WalletPage";
import LeadersPage from "@/pages/LeadersPage/LeadersPage";
import ReferallsPage from "@/pages/ReferralPage/ReferralPage";
import ConnectSolPage from "@/pages/ConnectSolPage/ConnectSolPage";
import VerifySignaturePage from "@/pages/SignSolPage/SignSolPage";
import { GamesPage } from "@/pages/GamesPage/GamesPage";
import { LuckyTapPage } from "@/pages/LuckyTapPage/LuckyTapPage";
import { Lucky31Page } from "@/pages/Lucky31Page/Lucky31Page";

// eslint-disable-next-line react-refresh/only-export-components
const RouterPages: { path: string; element: JSX.Element }[] = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.WALLET,
    element: <WalletPage />,
  },
  {
    path: ROUTES.LEADERS,
    element: <LeadersPage />,
  },
  {
    path: ROUTES.GAMES,
    element: <GamesPage />,
  },
  {
    path: ROUTES.REFERRAL,
    element: <ReferallsPage />,
  },
  {
    path: ROUTES.CONNECT_SOL,
    element: <ConnectSolPage />,
  },
  {
    path: ROUTES.SIGN_SOL,
    element: <VerifySignaturePage />,
  },
  {
    path: ROUTES.LUCKY_TAP,
    element: <LuckyTapPage />,
  },
  {
    path: ROUTES.LUCKY_31,
    element: <Lucky31Page />,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: RouterPages,
  },
]);
