import axios from "axios";

import { TokenInfo, TokenInfoEntries } from "./token-info";

const DEFAULT_API_URL = "https://core-dev.a11bd.net";

export async function getTokenInfo(apiUrl: string = DEFAULT_API_URL): Promise<TokenInfo> {
  const { data, status } = await axios.get<TokenInfoEntries>(
      apiUrl + "/token-info",
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  return new TokenInfo(data);
}
