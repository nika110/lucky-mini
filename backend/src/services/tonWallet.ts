import { TonClient, WalletContractV4, internal, beginCell } from "@ton/ton";
import { mnemonicToPrivateKey, KeyPair } from "@ton/crypto";

export class TonTransactionWalletService {
  private static instance: TonTransactionWalletService | null = null;
  private client: TonClient;
  private wallet: WalletContractV4 | null = null;
  private keyPair: KeyPair | null = null;

  private constructor() {
    this.client = new TonClient({
      endpoint: process.env.TON_ENDPOINT as string,
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
      const mnemonic = process.env.SERVICE_WALLET_MNEMONIC as string;
      if (!mnemonic) {
        throw new Error("Service wallet mnemonic not configured");
      }
      this.keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
    }
    return this.keyPair;
  }

  private async initializeWallet(): Promise<WalletContractV4> {
    if (!this.wallet) {
      const keyPair = await this.getKeyPair();
      this.wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0,
      });
    }
    return this.wallet;
  }

  public async payoutTon(
    recipientAddress: string,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const wallet = await this.initializeWallet();
      const keyPair = await this.getKeyPair();

      // Convert amount to nanotons (1 TON = 1e9 nanotons)
      const amountInNano = BigInt(Math.floor(parseFloat(amount) * 1e9));

      // Create the message cell
      const message = beginCell()
        .storeUint(0, 32) // op = 0
        .storeStringTail("Raffle payout")
        .endCell();

      const provider = this.client.provider(wallet.address, wallet.init);
      const seqno = await wallet.getSeqno(provider);

      // Create the transfer
      const transfer = wallet.createTransfer({
        seqno,
        messages: [
          internal({
            to: recipientAddress,
            value: amountInNano,
            bounce: false,
            body: message,
          }),
        ],
        secretKey: keyPair.secretKey,
      });

      const result = (await wallet.send(provider, transfer)) as any;

      return {
        success: true,
        txHash: result.hash,
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
