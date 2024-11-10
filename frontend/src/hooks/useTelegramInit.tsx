/* eslint-disable react-hooks/exhaustive-deps */
import { useInitializeUserMutation } from "@/redux/services/user.api";
import { useEffect, useState } from "react";

const useTelegramInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const [initialize] = useInitializeUserMutation();

  useEffect(() => {
    const initUser = async () => {
      try {
        // Проверяем, был ли уже первый запуск
        const hasInitialized = localStorage.getItem("tg_app_initialized");

        if (!hasInitialized) {
          const userID = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

          if (!userID) {
            console.error("User ID not found in Telegram Web App data");
            return;
          }

          initialize({
            telegramId: userID + "",
          })
            .unwrap()
            .then((res) => {
              alert(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
              if ("success" in res && res.success) {
                setIsInitialized(true);
              }
            })
            .catch((error) => {
              alert(JSON.stringify(error));
            });
        } else {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    initUser();
  }, []);

  return { isInitialized };
};

export default useTelegramInit;
