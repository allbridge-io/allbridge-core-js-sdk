import axios from "axios";
import { TokensInfo, TokensInfoEntries } from "./tokens-info";

interface AllbridgeCoreSdkOptions {
  apiUrl: string;
}

export class AllbridgeCoreSdk {
  apiUrl: string;

  constructor(params: AllbridgeCoreSdkOptions) {
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
