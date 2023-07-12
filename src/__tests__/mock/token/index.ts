import { TokenService } from "../../../services/token";

export const mockedTokenBalance = "1234567890";

export function mockTokenService_getTokenBalance() {
  const tokenBalance = jest.spyOn(TokenService.prototype as any, "getTokenBalance");
  tokenBalance.mockImplementation(() => {
    return mockedTokenBalance;
  });
}
