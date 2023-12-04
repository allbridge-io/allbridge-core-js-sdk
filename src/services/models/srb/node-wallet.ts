import { Wallet, XDR_BASE64 } from "./method-options";
import { Keypair, TransactionBuilder } from "soroban-client";

export class NodeWallet implements Wallet {
  private readonly keypair: Keypair;
  constructor(key: Keypair | string, private readonly networkPassphrase: string) {
    if (typeof key === "string") {
      this.keypair = Keypair.fromSecret(key);
    } else {
      this.keypair = key;
    }
  }
  async getUserInfo(): Promise<{ publicKey?: string }> {
    return {
      publicKey: this.keypair.publicKey(),
    };
  }

  async isAllowed(): Promise<boolean> {
    return true;
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async signTransaction(tx: XDR_BASE64): Promise<XDR_BASE64> {
    const transaction = TransactionBuilder.fromXDR(tx, this.networkPassphrase);
    transaction.sign(this.keypair);
    return transaction.toXDR();
  }
}
