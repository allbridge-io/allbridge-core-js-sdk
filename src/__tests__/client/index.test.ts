import axios from "axios";
import { beforeEach, describe, expect, it, Mocked, vitest as vi } from "vitest";
import { AllbridgeCoreClient } from "../../client";
import tokenInfoResponse from "../mock/api/token-info.json";

vi.mock("axios");

const mockedAxios = axios as Mocked<typeof axios>;

describe("TokenInfo", () => {
  let client: AllbridgeCoreClient;

  beforeEach(() => {
    client = new AllbridgeCoreClient({ apiUrl: "testApiUrl" });
  });

  describe("given /tokenInfo endpoint", () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      statusText: "Ok",
      headers: {},
      config: {},
      data: tokenInfoResponse,
    });

    describe("when called", () => {
      it("returns TokenInfo object", async () => {
        const tokensInfo = await client.getTokensInfo();
        expect(tokensInfo.entries).toEqual(tokenInfoResponse);
      });
    });
  });
});
