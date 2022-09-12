import {describe, expect, it, Mocked, vitest as vi} from "vitest";
import {getTokenInfo} from "../index";
import axios from 'axios';
import tokenInfoResponse from './mock/api/token-info.json';

vi.mock("axios");

const mockedAxios = axios as Mocked<typeof axios>;

describe("TokenInfo", () => {
  describe("given /tokenInfo endpoint", () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      statusText: 'Ok',
      headers: {},
      config: {},
      data: tokenInfoResponse
    });

    describe("when called", () => {
      it("returns TokenInfo object", async () => {
        const tokenInfo = await getTokenInfo();

        expect(tokenInfo).toBeDefined();
        expect(tokenInfo.entries).toBeDefined();
        expect(tokenInfo.entries.GRL).toBeDefined();
        expect(tokenInfo.entries.GRL.tokens.length).toEqual(2);
        expect(tokenInfo.entries.GRL.chainId).toEqual(2);
        expect(tokenInfo.entries.GRL.bridgeAddress).toEqual("0xba285A8F52601EabCc769706FcBDe2645aa0AF18");
        expect(tokenInfo.entries.GRL.confirmations).toEqual(5);
        expect(tokenInfo.entries.RPS).toBeDefined();
        expect(tokenInfo.entries.RPS.tokens.length).toEqual(2);
        expect(tokenInfo.entries.RPS.chainId).toEqual(3);
        expect(tokenInfo.entries.RPS.bridgeAddress).toEqual("0x8aD93d65FFe170d0d72F7682d6E9Caf0F1A4c03d");
        expect(tokenInfo.entries.RPS.confirmations).toEqual(5);
        expect(tokenInfo.entries.TRX).toBeDefined();
        expect(tokenInfo.entries.TRX.tokens.length).toEqual(2);
        expect(tokenInfo.entries.TRX.chainId).toEqual(4);
        expect(tokenInfo.entries.TRX.bridgeAddress).toEqual("TWU3j4etqPT4zSwABPrgmak3uXFSkxpPwM");
        expect(tokenInfo.entries.TRX.confirmations).toEqual(20);
      });
    });
  });
});
