import Header from "@/components/features/Header/Header";
import MainGame from "@/components/features/MainGame/MainGame";
import Navbar from "@/components/features/Navbar/Navbar";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { FC } from "react";
// import cl from "./HomePage.module.css";

const HomePage: FC = () => {
  const { isSuccess, user } = useTelegramUser();
  if (isSuccess && user) {
    console.log(user);
  }

  return (
    <div>
      <Header user={user} />
      <MainGame user={user} />
      <Navbar />
    </div>
  );
};

export default HomePage;
