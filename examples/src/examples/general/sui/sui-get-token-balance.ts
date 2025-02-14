import * as dotenv from "dotenv";
import { getEnvVar } from "../../../utils/env";
import { AllbridgeCoreSdk, ChainSymbol, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../../utils/utils";

dotenv.config({ path: ".env" });

const main = async () => {
  const tokenAddress = getEnvVar("SUI_TOKEN_ADDRESS");
  const accountAddress = getEnvVar("SUI_ACCOUNT_ADDRESS");

  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const nativeTokenBalance = await sdk.getNativeTokenBalance({ account: accountAddress, chainSymbol: ChainSymbol.SUI });
  console.log("Native Token Balance: ", nativeTokenBalance);

  const tokenInfo = ensure((await sdk.tokens()).find((tokenInfo) => tokenInfo.originTokenAddress === tokenAddress));

  const tokenBalanceData = {
    account: accountAddress,
    token: tokenInfo,
  };

  const tokenBalance = await sdk.getTokenBalance(tokenBalanceData);
  console.log("Token Balance: ", tokenBalance);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
