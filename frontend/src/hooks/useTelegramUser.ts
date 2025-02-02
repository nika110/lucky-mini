import { IUserRegistration } from "./../../../backend/src/types/interfaces";
import { useEffect, useState, useRef, useCallback } from "react";
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
  const { data: isInitLocal} = useCloudStorage(STORAGE_KEYS.TOKEN);
  const tokenData = isInitLocal as string;

  const [error, setError] = useState<unknown | null>(null);
  const initializationRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [token, setToken] = useState<string | null | false>(tokenData === undefined ? null : tokenData);

  const initData = window.Telegram?.WebApp?.initData;
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  const [initializeUser] = useInitializeUserMutation();

  console.log("token ", isInitLocal);

  useEffect(() => {
    if (isInitLocal) {
      setToken(isInitLocal as string);
    } else {
      setToken(false);
    }
  }, [isInitLocal]);


  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    isSuccess: isSuccessUser,
    error: userError,
  } = useGetUserQuery(tgUser!.id!, {
    skip: !tgUser?.id || (!isInitLocal && !isInitializing),
  });

  const handleTokenRemoval = useCallback(async () => {
    return new Promise((resolve) =>
      WebApp.CloudStorage.removeItem(STORAGE_KEYS.TOKEN, (_, r) => {
        if (r && typeof r === "string") {
          resolve(r);
        } else {
          resolve(null);
        }
      })
    );
  }, []);

  const handleUserInitialization = useCallback(async () => {
    if (!tgUser || token || isInitializing || initializationRef.current) {
      return;
    }

    try {
      setIsInitializing(true);
      initializationRef.current = true;

      const initPayload: IUserRegistration = {
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

      const response = await initializeUser(initPayload).unwrap();
      if (response.data && response.success && "token" in response.data) {
        await new Promise<void>((resolve) => {
          WebApp.CloudStorage.setItem(
            STORAGE_KEYS.TOKEN,
            response.data.token,
            () => resolve()
          );
        });
      }
    } catch (err) {
      setError(err);
      toast.error("Failed to initialize user, please try again later!");
    } finally {
      setIsInitializing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tgUser,
    isInitLocal,
    isInitializing,
    initData,
    startParam,
    initializeUser,
  ]);

  useEffect(() => {
    if (userError) {
      const handleError = async () => {
        try {
          await handleTokenRemoval();
          setError(userError);
        } catch (err) {
          console.error("Failed to remove token:", err);
          setError(userError);
        }
      };
      void handleError();
    }
  }, [userError, handleTokenRemoval]);

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      if (!isLoadingUser && !isInitializing && mounted) {
        await handleUserInitialization();
      }
    };

    void initUser();

    return () => {
      mounted = false;
    };
  }, [isLoadingUser, isInitializing, handleUserInitialization]);

  return {
    isLoading: isLoadingUser || isFetchingUser || isInitializing,
    isSuccess: isSuccessUser,
    error,
    user: user ? user.data : null,
  };
};
