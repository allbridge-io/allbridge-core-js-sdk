import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { ABIMethod, Algodv2, OnApplicationComplete } from "algosdk";
import { ChainSymbol, RawAlgTransaction } from "../../index";
import { NodeRpcUrlsConfig } from "../../services";
import { encodeTxs } from "../../services/utils/alg";

/**
 * Contains usefully Alg methods
 */
export interface AlgUtils {
  checkAssetOptIn(assetId: string | bigint, sender: string, client?: Algodv2): Promise<boolean>;
  checkAppOptIn(appId: string | bigint, sender: string, client?: Algodv2): Promise<boolean>;
  buildRawTransactionAssetOptIn(assetId: string | bigint, sender: string, client?: Algodv2): Promise<RawAlgTransaction>;
  buildRawTransactionAppOptIn(appId: string | bigint, sender: string, client?: Algodv2): Promise<RawAlgTransaction>;
}

export class DefaultAlgUtils implements AlgUtils {
  constructor(readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig) {}

  async checkAssetOptIn(assetId: string | bigint, sender: string, client?: Algodv2): Promise<boolean> {
    const algorand = this.getAlgorand(client);
    if (typeof assetId === "string") {
      assetId = BigInt(assetId);
    }
    const info = await algorand.account.getInformation(sender);
    const assets = info.assets;
    if (assets) {
      const isOptedIn = assets.find(({ assetId: id }) => id === assetId);
      return isOptedIn !== undefined;
    }
    return false;
  }

  async checkAppOptIn(appId: string | bigint, sender: string, client?: Algodv2): Promise<boolean> {
    const algorand = this.getAlgorand(client);
    if (typeof appId === "string") {
      appId = BigInt(appId);
    }
    const info = await algorand.account.getInformation(sender);
    const localStates = info.appsLocalState;
    if (localStates) {
      const isOptedIn = localStates.find(({ id }) => id === appId);
      return isOptedIn !== undefined;
    }
    return false;
  }

  async buildRawTransactionAssetOptIn(
    assetId: string | bigint,
    sender: string,
    client?: Algodv2
  ): Promise<RawAlgTransaction> {
    const algorand = this.getAlgorand(client);
    if (typeof assetId === "string") {
      assetId = BigInt(assetId);
    }
    const tx = await algorand.createTransaction.assetOptIn({ assetId: assetId, sender: sender });
    return encodeTxs(tx);
  }

  async buildRawTransactionAppOptIn(
    appId: string | bigint,
    sender: string,
    client?: Algodv2
  ): Promise<RawAlgTransaction> {
    const algorand = this.getAlgorand(client);
    if (typeof appId === "string") {
      appId = BigInt(appId);
    }

    const composer = algorand.newGroup();
    const signer = algorand.account.random();
    composer.addAppCallMethodCall({
      appId,
      method: new ABIMethod({
        name: "optInToApplication",
        desc: undefined,
        args: [],
        returns: { type: "void", desc: undefined },
        events: [],
        readonly: false,
      }),
      args: [],
      sender,
      signer: signer,
      onComplete: OnApplicationComplete.OptInOC,
    });
    const { transactions } = await composer.buildTransactions();
    return encodeTxs(...transactions);
  }

  private getAlgorand(client?: Algodv2): AlgorandClient {
    if (client) {
      return AlgorandClient.fromClients({ algod: client });
    } else {
      const nodeRpcUrl = this.nodeRpcUrlsConfig.getNodeRpcUrl(ChainSymbol.ALG);
      return AlgorandClient.fromConfig({
        algodConfig: { server: nodeRpcUrl },
      });
    }
  }
}
