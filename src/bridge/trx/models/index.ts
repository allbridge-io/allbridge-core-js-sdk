import { TronWeb } from "tronweb-typings";
import { TronBridge } from "..";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { ApprovalBridge, BaseProvider } from "../../models";

export class TronProvider extends BaseProvider {
  chainType: ChainType.TRX = ChainType.TRX;
  tronWeb: TronWeb;

  constructor(tronWeb: TronWeb) {
    super();
    this.tronWeb = tronWeb;
  }

  getBridge(api: AllbridgeCoreClient): ApprovalBridge {
    return new TronBridge(api, this.tronWeb);
  }
}
