import { AllbridgeCoreSdkService } from "../services";
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

  constructor(readonly service: AllbridgeCoreSdkService) {
    this.srb = new DefaultSrbUtils(service.nodeRpcUrlsConfig, service.params);
    this.sol = new DefaultSolUtils(service.nodeRpcUrlsConfig, service.params);
    this.sui = new DefaultSuiUtils(service.nodeRpcUrlsConfig, service.api);
    this.evm = new DefaultEvmUtils(service.nodeRpcUrlsConfig, service.params);
  }
}
