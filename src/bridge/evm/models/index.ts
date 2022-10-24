import Web3 from "web3";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { ApprovalBridge, BaseProvider } from "../../models";
import { EvmBridge } from "../index";

export class EvmProvider extends BaseProvider {
  chainType: ChainType.EVM = ChainType.EVM;
  web3: Web3;

  constructor(web3: Web3) {
    super();
    this.web3 = web3;
  }

  getBridge(api: AllbridgeCoreClient): ApprovalBridge {
    return new EvmBridge(api, this.web3);
  }
}
