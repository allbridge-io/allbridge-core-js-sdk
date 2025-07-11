import { AllbridgeCoreSdkOptions } from "../index";
import { NodeRpcUrlsConfig } from "../services";
import { DefaultEvmUtils, EvmUtils } from "./evm";
import { DefaultSolUtils, SolUtils } from "./sol";
import { DefaultSrbUtils, SrbUtils } from "./srb";
import { DefaultSuiUtils, SuiUtils } from "./sui";

/**
 * Contains usefully methods
 */
export interface Utils {
  srb: SrbUtils;
  sol: SolUtils;
  sui: SuiUtils;
  evm: EvmUtils;
}

export class DefaultUtils implements Utils {
  srb: SrbUtils;
  sol: SolUtils;
  sui: SuiUtils;
  evm: EvmUtils;

  constructor(
    readonly nodeRpcUrlsConfig: NodeRpcUrlsConfig,
    params: AllbridgeCoreSdkOptions
  ) {
    this.srb = new DefaultSrbUtils(nodeRpcUrlsConfig, params);
    this.sol = new DefaultSolUtils(nodeRpcUrlsConfig, params);
    this.sui = new DefaultSuiUtils(nodeRpcUrlsConfig, params);
    this.evm = new DefaultEvmUtils(nodeRpcUrlsConfig, params);
  }
}
