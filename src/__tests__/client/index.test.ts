import nock from "nock";
import { beforeEach, describe, expect, it } from "vitest";
import { AllbridgeCoreClient } from "../../client";
import tokenInfoResponse from "../mock/api/token-info.json";

describe("TokenInfo", () => {
  let client: AllbridgeCoreClient;

  beforeEach(() => {
    client = new AllbridgeCoreClient({ apiUrl: "http://localhost" });
  });

  describe("given /tokenInfo endpoint", () => {
    const scope = nock("http://localhost")
      .get("/token-info")
      .reply(200, tokenInfoResponse);

    describe("when called", () => {
      it("returns TokenInfo object", async () => {
        const tokensInfo = await client.getTokensInfo();
        expect(tokensInfo.entries).toEqual(tokenInfoResponse);
        scope.done();
      });
    });
  });
});
