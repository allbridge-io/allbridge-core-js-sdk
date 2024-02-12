import { AllbridgeCoreSdkOptions } from "../index";
import { NodeRpcUrlsConfig } from "../services";
import { DefaultSolUtils, SolUtils } from "./sol";
import { DefaultSrbUtils, SrbUtils } from "./srb";

/**
 * Contains usefully methods
 */
export interface Utils {
  srb: SrbUtils;
  sol: SolUtils;
}

export class DefaultUtils implements Utils {
  srb: SrbUtils;
  sol: SolUtils;

  constructor(readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig, params: AllbridgeCoreSdkOptions) {
    this.srb = new DefaultSrbUtils(nodeRpcUrlsConfig, params);
    this.sol = new DefaultSolUtils(nodeRpcUrlsConfig, params);
  }
}
