import { AllbridgeCoreSdk, ChainSymbol, Messenger, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../utils/utils";

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chainDetailsMap = await sdk.chainDetailsMap();

  const sourceToken = ensure(chainDetailsMap[ChainSymbol.POL].tokens.find((token) => token.symbol === "USDC"));
  const destToken = ensure(chainDetailsMap[ChainSymbol.ETH].tokens.find((token) => token.symbol === "USDC"));

  const extraGasMax = await sdk.getExtraGasMaxLimits(sourceToken, destToken, Messenger.CCTP);
  console.log("extraGas Limits =", JSON.stringify(extraGasMax, null, 2));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
