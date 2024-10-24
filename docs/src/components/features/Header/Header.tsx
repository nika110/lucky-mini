import { LogoFull } from "@/components/shared/UI/Icons/LogoFull";
import { ROUTES } from "@/routes/routes";
import { FC } from "react";
import { Link } from "react-router-dom";
import ConnectWallets from "../ConnectWallets/ConnectWallets";
import { motion } from "framer-motion";
// import cl from "./Header.module.css";

const Header: FC = () => {
  return (
    <header className={"pt-8"}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="container flex justify-between items-center"
      >
        <Link to={ROUTES.HOME}>
          <LogoFull />
        </Link>
        <ConnectWallets />
      </motion.div>
    </header>
  );
};

export default Header;
