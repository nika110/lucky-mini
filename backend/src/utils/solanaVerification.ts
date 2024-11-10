import { PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';

export class SolanaVerification {
  static async verifySignature(
    message: string,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      const decodedSignature = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);
      const publicKeyBytes = new PublicKey(publicKey).toBytes();

      // Verify the signature
      return sign.detached.verify(
        messageBytes,
        decodedSignature,
        publicKeyBytes
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
}
