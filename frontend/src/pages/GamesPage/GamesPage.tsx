import { Games } from "@/components/features/Games/Games";
import Navbar from "@/components/features/Navbar/Navbar";
import { useTelegramUser } from "@/hooks/useTelegramUser";

export const GamesPage = () => {
  const { isSuccess, user } = useTelegramUser();
  if (isSuccess && user) {
    console.log(user);
  }

  return (
    <div>
      <Games user={user}/>
      <Navbar />
    </div>
  );
};
