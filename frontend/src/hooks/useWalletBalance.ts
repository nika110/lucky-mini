import { TonBalanceService } from "@/lib/balanceService";
import { useState, useEffect } from "react";

const balanceService = new TonBalanceService();

export function useWalletBalance(address: string | null) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const pollInterval = 30000; // Poll every 30 seconds

    const fetchBalance = async () => {
      if (!address) return;

      try {
        setLoading(true);
        const newBalance = await balanceService.getBalance(address);
        if (isMounted) {
          setBalance(newBalance);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch balance")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchBalance();

    // Set up polling
    const intervalId = setInterval(fetchBalance, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [address]);

  return { balance, loading, error };
}
