import { AllbridgeCoreSdk, nodeUrlsDefault } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../utils/utils";

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeUrlsDefault);

  const tokens = await sdk.tokens();
  const sourceToken = ensure(tokens.find((token) => token.chainSymbol === "ETH" && token.symbol === "USDT"));
  const destinationToken = ensure(tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT"));
  const amount = "100.5";

  console.log(
    "%d %s on %s to %s on %s",
    amount,
    sourceToken.symbol,
    sourceToken.chainSymbol,
    destinationToken.symbol,
    destinationToken.chainSymbol
  );

  const sourceFeePercent = await sdk.calculateFeePercentOnSourceChain(amount, sourceToken);
  console.log("Fee on the source chain = %s%", sourceFeePercent.toFixed(2));

  const destinationFeePercent = await sdk.calculateFeePercentOnDestinationChain(amount, sourceToken, destinationToken);
  console.log("Fee on the destination chain = %s%", destinationFeePercent.toFixed(2));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
