import {
  TonClient,
  WalletContractV5R1,
  internal,
  beginCell,
  Cell,
  Address,
  contractAddress,
  SendMode,
} from "@ton/ton";
import { mnemonicToPrivateKey, KeyPair, mnemonicNew } from "@ton/crypto";

export class TonTransactionWalletService {
  private static instance: TonTransactionWalletService | null = null;
  private client: TonClient;
  private wallet: WalletContractV5R1 | null = null;
  private keyPair: KeyPair | null = null;

  private constructor() {
    const apiKey = process.env.TON_API_KEY;
    if (!apiKey) {
      throw new Error("TON_API_KEY is not defined in environment variables");
    }

    this.client = new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
      apiKey,
    });
    this.wallet = null;
    this.keyPair = null;
  }

  public static getInstance(): TonTransactionWalletService {
    if (!TonTransactionWalletService.instance) {
      TonTransactionWalletService.instance = new TonTransactionWalletService();
    }
    return TonTransactionWalletService.instance;
  }

  private async getKeyPair(): Promise<KeyPair> {
    if (!this.keyPair) {
      const mnemonic = (process.env.SERVICE_WALLET_MNEMONIC as string)
        .replace(/"/g, "")
        .split(" ");
      console.log("mnemonic", mnemonic);
      if (!mnemonic) {
        throw new Error("Service wallet mnemonic not configured");
      }
      this.keyPair = await mnemonicToPrivateKey(mnemonic);
    }
    return this.keyPair;
  }

  private async initializeWallet(): Promise<WalletContractV5R1> {
    if (!this.wallet) {
      const keyPair = await this.getKeyPair();
      this.wallet = WalletContractV5R1.create({
        publicKey: keyPair.publicKey,
        workchain: 0,
      });
    }
    return this.wallet;
  }

  public async payoutTon(
    recipientAddressRaw: string,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const wallet = await this.initializeWallet();
      const keyPair = await this.getKeyPair();
      const recipientAddress = Address.parseRaw(recipientAddressRaw).toString();

      console.log("processing PAYOUT TO - ", recipientAddress);
      let contract = this.client.open(wallet);

      let seqno: number = await contract.getSeqno();
      const transfer = contract.createTransfer({
        seqno,
        messages: [
          internal({
            value: amount + "",
            to: recipientAddress,
            bounce: false,
          }),
        ],
        sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
        secretKey: keyPair.secretKey,
      });
      // Actually send the transaction
      await contract.send(transfer);

      const txHash = transfer.hash().toString("hex");

      return {
        success: true,
        txHash,
      };
    } catch (error: any) {
      console.error("Error in payoutTon:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
