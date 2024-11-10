import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bs58 from "bs58";
import {
  useGetUserQuery,
  useInitializeUserMutation,
} from "@/redux/services/user.api";
import { LOCAL_STORAGE_KEYS } from "@/utils/localStorage";
import { toast } from "sonner";
import { User } from "@/types/user";

interface UseTelegramUserResult {
  isLoading: boolean;
  error: unknown | null;
  user: User | null;
}

export const useTelegramUser = (): UseTelegramUserResult => {
  const [error, setError] = useState<unknown | null>(null);
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const isInitLocal = localStorage.getItem(LOCAL_STORAGE_KEYS.TG_INIT_USER);

  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

  const [initializeUser] = useInitializeUserMutation();

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUserQuery(tgUser!.id!, {
    skip: !isInitLocal || !tgUser?.id,
  });

  useEffect(() => {
    const initUser = async () => {
      if (!tgUser) return;
      try {
        if (user) return;
        const userInitials = `${tgUser.first_name} ${
          tgUser.last_name || ""
        }`.trim();
        const initPayload = {
          telegramId: tgUser.id.toString(),
          username: userInitials,
        };
        if (startParam) {
          try {
            const decodedParams = Buffer.from(bs58.decode(startParam))
              .toString("utf8")
              .replace(/^'|'$/g, "");

            const { referralCode } = JSON.parse(decodedParams);
            if (referralCode) {
              Object.assign(initPayload, { referralCode });
            }
          } catch (err) {
            console.error("Failed to parse start parameters:", err);
          }
        }

        await initializeUser(initPayload)
          .unwrap()
          .then((res) => {
            if (res.data && "success" in res && res.success) {
              localStorage.setItem(LOCAL_STORAGE_KEYS.TG_INIT_USER, "true");
            }
          });
      } catch (err) {
        setError(err);
        toast.error("Failed to initialize user, please try again later!");
      }
    };
    if (!isLoadingUser) {
      void initUser();
    }
  }, [tgUser, user, isLoadingUser, initializeUser, startParam]);

  useEffect(() => {
    if (userError) {
      setError(userError);
    }
  }, [userError]);

  return {
    isLoading: isLoadingUser,
    error,
    user: user ? user.data : null,
  };
};
