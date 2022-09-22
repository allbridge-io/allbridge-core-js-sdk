import axios from "axios";
import { ChainDetailsMapDTO } from "./dto/api.model";
import { TokensInfo, mapChainDetailsMapFromDTO } from "./tokens-info";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  apiUrl: string;

  constructor(params: AllbridgeCoreSdkOptions) {
    this.apiUrl = params.apiUrl;
  }

  async getTokensInfo(): Promise<TokensInfo> {
    const { data } = await axios.get<ChainDetailsMapDTO>(
      this.apiUrl + "/token-info",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return new TokensInfo(mapChainDetailsMapFromDTO(data));
  }
}
