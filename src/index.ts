import { AllbridgeCoreClient, IClientParams } from "./client";

interface IAllbridgeCoreSdkOptions {
  api: IClientParams;
}

export class AllbridgeCoreSdk {
  api: AllbridgeCoreClient;

  constructor(params: IAllbridgeCoreSdkOptions) {
    this.api = new AllbridgeCoreClient(params.api);
  }
}
