import { Cell, Address, beginCell } from "@ton/ton";

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
  private readonly accessToken: string;

  private constructor() {
    const accessToken = process.env.GETBLOCK_API_KEY;
    if (!accessToken) {
      throw new Error(
        "GETBLOCK_ACCESS_TOKEN is not defined in environment variables"
      );
    }
    this.accessToken = accessToken;
  }

  public static getInstance(): TonTransactionService {
    if (!TonTransactionService.instance) {
      TonTransactionService.instance = new TonTransactionService();
    }
    return TonTransactionService.instance;
  }

  private convertNanoToTon(nanoTons: bigint | string): string {
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

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getTransactions(address: string): Promise<any[]> {
    try {
      const url = `https://go.getblock.io/${this.accessToken}/getTransactions?address=${address}&limit=10`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(
          `API Error: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      return data.result || [];
    } catch (error) {
      console.error("Failed to get transactions:", error);
      throw new TonTransactionError(
        "Failed to get transactions",
        TonErrorCodes.TRANSACTION_NOT_FOUND,
        error
      );
    }
  }

  public async validateBoc(
    bocString: string,
    destinationAddress: string
  ): Promise<TransactionValidationResult> {
    try {
      // Parse and validate the destination address
      const parsedAddress = Address.parse(destinationAddress);

      // Parse the BOC to get its hash for transaction lookup
      let cell;
      try {
        cell = Cell.fromBase64(bocString);
      } catch (error) {
        throw new TonTransactionError(
          "Invalid BOC string",
          TonErrorCodes.INVALID_BOC,
          error
        );
      }

      const bocHash = cell.hash().toString("hex");
      console.log(`Validating BOC with hash: ${bocHash}`);

      // Max attempts and delay configuration
      const maxAttempts = 10;
      const attemptDelay = 3000; // 3 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          if (attempt > 0) {
            console.log(
              `Waiting ${attemptDelay}ms before attempt ${attempt + 1}...`
            );
            await this.delay(attemptDelay);
          }

          console.log(
            `Checking transaction status, attempt ${attempt + 1}/${maxAttempts}`
          );

          // Get recent transactions for the address
          const transactions = await this.getTransactions(
            parsedAddress.toString()
          );
          console.log(`Retrieved ${transactions.length} transactions`);

          // Look for a matching transaction
          for (const tx of transactions) {
            // First, check if this transaction matches our BOC hash
            const txHash = tx.transaction_id?.hash;
            const inMsgHash = tx.in_msg?.body_hash;

            console.log(
              "IS MATCHING",
              bocHash,
              Buffer.from(txHash, "base64").toString("hex")
            );

            const isMatch =
              // Compare with transaction hash
              (txHash &&
                Buffer.from(txHash, "base64").toString("hex") === bocHash) ||
              // Compare with in_msg body hash
              (inMsgHash && inMsgHash === bocHash) ||
              // Compare with in_msg data/body
              tx.in_msg?.msg_data?.body === bocString;

            if (isMatch) {
              console.log("Found matching transaction!");

              // If found, check if transaction was successful
              // In TON, a successful transaction typically has out_msgs
              if (tx.out_msgs && tx.out_msgs.length > 0) {
                // Get the amount from the first outgoing message
                // Assuming the first out_msg contains the transfer to the target address
                const outMsg = tx.out_msgs[0];
                const amount = outMsg.value || "0";

                console.log(
                  `Transaction successful! Amount: ${this.convertNanoToTon(
                    amount
                  )} TON`
                );

                return {
                  amount: this.convertNanoToTon(amount),
                  isValid: true,
                };
              }
            }
          }

          console.log("No matching transaction found in this attempt");
        } catch (error) {
          console.error(`Error in attempt ${attempt + 1}:`, error);
        }
      }

      console.log("Max attempts reached, transaction validation failed");
      return {
        amount: "0",
        isValid: false,
      };
    } catch (error) {
      console.error("BOC validation failed:", error);

      if (error instanceof TonTransactionError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes("Invalid address")) {
        throw new TonTransactionError(
          "Invalid destination address",
          TonErrorCodes.INVALID_ADDRESS,
          error
        );
      }

      return {
        amount: "0",
        isValid: false,
      };
    }
  }
}
