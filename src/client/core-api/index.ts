import axios from "axios";
import { TokensInfo } from "../../tokens-info";
import { mapChainDetailsMapFromDTO } from "./core-api-mapper";
import { ChainDetailsMapDTO } from "./core-api.model";

export interface AllbridgeCoreClientParams {
  apiUrl: string;
}

export class AllbridgeCoreClient {
  apiUrl: string;

  constructor(params: AllbridgeCoreClientParams) {
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
