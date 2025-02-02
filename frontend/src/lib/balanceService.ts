interface TonResponse {
  ok: boolean;
  result: {
    balance: string;
    state: string;
    "@type": string;
  };
}

export class TonBalanceService {
  private cache: Map<string, { balance: string; timestamp: number }>;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache
  private readonly API_ENDPOINT: string;

  constructor(
    endpoint: string = "https://toncenter.com/api/v2/getAddressInformation"
  ) {
    this.cache = new Map();
    this.API_ENDPOINT = endpoint;
  }

  async getBalance(address: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.cache.get(address);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return this.formatBalance(cached.balance);
      }

      // Fetch fresh balance
      const response = await fetch(`${this.API_ENDPOINT}?address=${address}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: TonResponse = await response.json();

      if (!data.ok || !data.result) {
        throw new Error("Invalid response from TON API");
      }

      // Update cache
      this.cache.set(address, {
        balance: data.result.balance,
        timestamp: Date.now(),
      });

      return this.formatBalance(data.result.balance);
    } catch (error) {
      console.error("Error fetching TON balance:", error);
      throw error;
    }
  }

  private formatBalance(balance: string): string {
    return (Number(balance) / 1e9).toFixed(2);
  }
}
