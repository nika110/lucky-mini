import {
  TonClient,
  WalletContractV4,
  internal,
  beginCell,
  Cell,
  Address,
  contractAddress,
} from "@ton/ton";
import { mnemonicToPrivateKey, KeyPair, mnemonicNew } from "@ton/crypto";

export class TonTransactionWalletService {
  private static instance: TonTransactionWalletService | null = null;
  private client: TonClient;
  private wallet: WalletContractV4 | null = null;
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
    recipientAddressRaw: string,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const wallet = await this.initializeWallet();
      const keyPair = await this.getKeyPair();
      const recipientAddress = Address.parseRaw(recipientAddressRaw).toString();

      const contract = this.client.open(wallet);
      const seqno = await contract.getSeqno();

      const amountInNano = BigInt(Math.floor(parseFloat(amount) * 1e9));

      const transfer = contract.createTransfer({
        seqno,
        messages: [
          internal({
            value: amountInNano,
            to: recipientAddress,
            bounce: false,
          }),
        ],
        secretKey: keyPair.secretKey,
      });

      const result = await contract.send(transfer) as any;

      return {
        success: true,
        txHash: result.hash,
      };

      // // Check if wallet is deployed
      // const provider = this.client.provider(wallet.address, wallet.init);
      // const isDeployed = (await provider.getState()).state.type;

      // if (isDeployed === "uninit" || isDeployed === "frozen") {
      //   console.log("Wallet contract is not deployed", isDeployed);
      //   return {
      //     success: false,
      //     error: "Wallet contract is not deployed",
      //   };
      // }

      // // Convert amount to nanotons (1 TON = 1e9 nanotons)
      // const amountInNano = BigInt(Math.floor(parseFloat(amount) * 1e9));

      // const recipientAddress = Address.parseRaw(recipientAddressRaw).toString();

      // // // Create the message cell
      // const message = beginCell()
      //   .storeUint(0, 32) // op = 0
      //   .storeStringTail("Payout from LuckyFI!")
      //   .endCell();

      // const seqno = await wallet.getSeqno(provider);

      // // // Create the transfer
      // const transfer = wallet.createTransfer({
      //   seqno,
      //   messages: [
      //     internal({
      //       to: recipientAddress,
      //       value: amountInNano,
      //       bounce: false,
      //       body: message,
      //     }),
      //   ],
      //   secretKey: keyPair.secretKey,
      // });

      // const result = (await wallet.send(provider, transfer)) as any;

      // return {
      //   success: true,
      //   txHash: result.hash,
      // };
    } catch (error: any) {
      console.error("Error in payoutTon:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
