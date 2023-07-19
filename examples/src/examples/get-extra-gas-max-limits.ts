import { AllbridgeCoreSdk, ChainSymbol, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../utils/utils";

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const chainDetailsMap = await sdk.chainDetailsMap();

  const sourceToken = ensure(chainDetailsMap[ChainSymbol.POL].tokens.find((token) => token.symbol === "USDC"));
  const destToken = ensure(chainDetailsMap[ChainSymbol.TRX].tokens.find((token) => token.symbol === "USDT"));

  const extraGasMax = await sdk.getExtraGasMaxLimits(sourceToken, destToken);
  console.log("extraGas Limits =", JSON.stringify(extraGasMax, null, 2));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
