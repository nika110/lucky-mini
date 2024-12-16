import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bs58 from "bs58";
import {
  useGetUserQuery,
  useInitializeUserMutation,
} from "@/redux/services/user.api";
import { toast } from "sonner";
import { User } from "@/types/user";
import WebApp from "@twa-dev/sdk";
import { STORAGE_KEYS } from "@/utils/constants";
import { useCloudStorage } from "./useCloudeStorage";

interface UseTelegramUserResult {
  isLoading: boolean;
  isSuccess: boolean;
  error: unknown | null;
  user: User | null;
}

export const useTelegramUser = (): UseTelegramUserResult => {
  const [error, setError] = useState<unknown | null>(null);
  const initData = window.Telegram?.WebApp?.initData;
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const { data: isInitLocal } = useCloudStorage(STORAGE_KEYS.TOKEN);
  console.log(isInitLocal);
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

  const [initializeUser] = useInitializeUserMutation();

  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    isSuccess: isSuccessUser,
    error: userError,
  } = useGetUserQuery(tgUser!.id!, {
    skip: !isInitLocal || !tgUser?.id,
  });

  useEffect(() => {
    console.log(isInitLocal);
    const initUser = async () => {
      if (!tgUser || isInitLocal === undefined || isInitLocal) return;
      try {
        if (user) return;
        const initPayload = {
          telegramId: tgUser.id.toString(),
          initData: initData,
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
              // console.log("init", res.data);
              if ("token" in res.data)
                WebApp.CloudStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
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
  }, [
    tgUser,
    user,
    isLoadingUser,
    initializeUser,
    startParam,
    initData,
    isInitLocal,
  ]);

  useEffect(() => {
    if (userError) {
      setError(userError);
    }
  }, [userError]);

  return {
    isLoading: isLoadingUser || isFetchingUser,
    isSuccess: isSuccessUser,
    error,
    user: user ? user.data : null,
  };
};
