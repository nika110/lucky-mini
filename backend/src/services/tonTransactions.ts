import {
  Cell,
  Address,
  TonClient,
  beginCell,
  storeMessage,
  TransactionDescription,
  CommonMessageInfoInternal,
} from "@ton/ton";

interface TransactionValidationResult {
  amount: string;
  isValid: boolean;
}

class TonTransactionError extends Error {
  constructor(message: string, public code: number, public details?: any) {
    super(message);
    this.name = "TonTransactionError";
  }
}

enum TonErrorCodes {
  INVALID_BOC = 1001,
  TRANSACTION_NOT_FOUND = 1002,
  INVALID_EXTERNAL = 1003,
  INVALID_ADDRESS = 1004,
}

export class TonTransactionService {
  private static instance: TonTransactionService | null = null;
  private readonly client: TonClient;

  private constructor() {
    const apiKey = process.env.TON_API_KEY;
    if (!apiKey) {
      throw new Error("TON_API_KEY is not defined in environment variables");
    }

    this.client = new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
      apiKey,
    });
  }

  public static getInstance(): TonTransactionService {
    if (!TonTransactionService.instance) {
      TonTransactionService.instance = new TonTransactionService();
    }
    return TonTransactionService.instance;
  }

  private convertNanoToTon(nanoTons: bigint | string): string {
    console.log("NANOTONS", nanoTons);
    const nanoTonsBig =
      typeof nanoTons === "string" ? BigInt(nanoTons) : nanoTons;
    const decimal = nanoTonsBig % 1000000000n;
    const whole = nanoTonsBig / 1000000000n;

    // Pad the decimal part with leading zeros if needed
    const decimalStr = decimal.toString().padStart(9, "0");

    // Remove trailing zeros after decimal point
    const trimmedDecimal = decimalStr.replace(/0+$/, "");

    // If there are no decimals after trimming, return just the whole number
    if (trimmedDecimal === "") {
      return whole.toString();
    }

    return `${whole}.${trimmedDecimal}`;
  }

  private async retry<T>(
    fn: () => Promise<T>,
    options: { retries: number; delay: number }
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < options.retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await new Promise((resolve) => setTimeout(resolve, options.delay));
        console.log(`Retry attempt ${i + 1}/${options.retries}`);
      }
    }

    throw new TonTransactionError(
      "Max retries exceeded",
      TonErrorCodes.TRANSACTION_NOT_FOUND,
      lastError
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async searchTransaction(
    parsedAddress: Address,
    bocString: string,
    attempt: number
  ): Promise<TransactionValidationResult> {
    console.log(`Search attempt ${attempt + 1}, getting fresh transactions...`);
    const transactions = await this.client.getTransactions(parsedAddress, {
      limit: 10, // Увеличили лимит для большей уверенности
    });

    for (const tx of transactions) {
      const inMsg = tx.inMessage;
      console.log(
        `Checking transaction ${tx.hash().toString("hex")}, type: ${
          inMsg?.info.type
        }`
      );

      if (inMsg?.info.type === "external-in") {
        const inBOC = inMsg?.body;

        if (typeof inBOC === "undefined") {
          console.log("Skipping undefined BOC");
          continue;
        }

        const extHash = Cell.fromBase64(bocString).hash().toString("hex");
        const inHash = beginCell()
          .store(storeMessage(inMsg))
          .endCell()
          .hash()
          .toString("hex");

        if (extHash === inHash) {
          const clearMessage = tx.outMessages.get(0);
          if (clearMessage) {
            const amount = (clearMessage.info as CommonMessageInfoInternal)
              .value.coins;

            const convertedAmount = this.convertNanoToTon(amount);
            return {
              amount: convertedAmount,
              isValid: true,
            };
          }
        }
      }
    }

    return {
      amount: "0",
      isValid: false,
    };
  }

  public async validateBoc(
    bocString: string,
    destinationAddress: string
  ): Promise<TransactionValidationResult> {
    try {
      const parsedAddress = Address.parse(destinationAddress);
      const searchAttempts = 5;
      const searchDelay = 5000;
      const maxRetries = 2;
      const retryDelay = 5000;

      for (let attempt = 0; attempt < searchAttempts; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`Waiting ${searchDelay}ms before next attempt...`);
            await this.delay(searchDelay);
          }

          const result = await this.retry(
            async () =>
              this.searchTransaction(parsedAddress, bocString, attempt),
            { retries: maxRetries, delay: retryDelay }
          );

          if (result.isValid) {
            return result;
          }

          console.log(`Attempt ${attempt + 1} didn't find the transaction`);
        } catch (error) {
          console.error(`Error in attempt ${attempt + 1}:`, error);
        }
      }

      console.log("Transaction not found after all attempts");
      return {
        amount: "0",
        isValid: false,
      };
    } catch (error) {
      console.error("Transaction validation failed:", error);
      return {
        amount: "0",
        isValid: false,
      };
    }
  }
}
