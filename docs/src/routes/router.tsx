import { Layout } from "@/pages/Layout";
import { ROUTES } from "./routes";
import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage/HomePage";
import WalletPage from "@/pages/WalletPage/WalletPage";
import LeadersPage from "@/pages/LeadersPage/LeadersPage";
import ReferallsPage from "@/pages/ReferralPage/ReferralPage";
import ConnectSolPage from "@/pages/ConnectSolPage/ConnectSolPage";

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
    path: ROUTES.REFERRAL,
    element: <ReferallsPage />,
  },
  {
    path: ROUTES.CONNECT_SOL,
    element: <ConnectSolPage />,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: RouterPages,
  },
]);
