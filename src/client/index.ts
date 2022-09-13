import axios from "axios";
import { TokensInfo, TokensInfoEntries } from "../tokens-info";

export interface IClientParams {
  apiUrl: string;
}

export class AllbridgeCoreClient {
  apiUrl: string;

  constructor(params: IClientParams) {
    this.apiUrl = params.apiUrl;
  }

  getTokensInfo = async (): Promise<TokensInfo> => {
    const { data } = await axios.get<TokensInfoEntries>(
      this.apiUrl + "/token-info",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return new TokensInfo(data);
  };
}
