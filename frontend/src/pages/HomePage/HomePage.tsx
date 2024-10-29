import Header from "@/components/features/Header/Header";
import MainGame from "@/components/features/MainGame/MainGame";
import Navbar from "@/components/features/Navbar/Navbar";
// import useTelegramInit from "@/hooks/useTelegramInit";
import { FC } from "react";
// import cl from "./HomePage.module.css";

const HomePage: FC = () => {
  // useTelegramInit();
  return (
    <div>
      <Header />
      <MainGame />
      <Navbar />
    </div>
  );
};

export default HomePage;
