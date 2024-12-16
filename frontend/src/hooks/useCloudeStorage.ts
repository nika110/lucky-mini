import WebApp from "@twa-dev/sdk";
import { useCallback, useEffect, useState } from "react";

interface UseCloudStorageResult<T> {
  data: T | null | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  setValue: (value: T) => Promise<void>;
  removeValue: () => Promise<void>;
}

export const useCloudStorage = <T,>(key: string): UseCloudStorageResult<T> => {
  const [data, setData] = useState<T | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getValue = useCallback(async (): Promise<T | null> => {
    return new Promise((resolve) => {
      WebApp.CloudStorage.getItem(key, (error, result) => {
        if (error) {
          throw new Error(error);
        }

        if (result && typeof result === "string") {
          try {
            resolve(JSON.parse(result));
          } catch {
            resolve(result as unknown as T);
          }
        } else {
          resolve(null);
        }
      });
    });
  }, [key]);

  const setValue = useCallback(
    async (value: T): Promise<void> => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const stringValue =
          typeof value === "string" ? value : JSON.stringify(value);

        await new Promise<void>((resolve, reject) => {
          WebApp.CloudStorage.setItem(key, stringValue, (error, success) => {
            if (error || !success) {
              reject(new Error(error || "Failed to set value"));
            } else {
              resolve();
            }
          });
        });

        setData(value);
        setIsSuccess(true);
      } catch (err) {
        setIsError(true);
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [key]
  );

  const removeValue = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        WebApp.CloudStorage.removeItem(key, (error, success) => {
          if (error || !success) {
            reject(new Error(error || "Failed to remove value"));
          } else {
            resolve();
          }
        });
      });

      setData(null);
      setIsSuccess(true);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const value = await getValue();

        if (mounted) {
          setData(value);
          setIsSuccess(true);
        }
      } catch (err) {
        if (mounted) {
          setIsError(true);
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [getValue]);

  return {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setValue,
    removeValue,
  };
};
