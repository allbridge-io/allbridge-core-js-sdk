import { AllbridgeCoreSdk, nodeRpcUrlsDefault } from "@allbridge/bridge-core-sdk";

const main = async () => {
  const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

  const chainDetailsMap = await sdk.chainDetailsMap();
  console.log("Chain details map =", JSON.stringify(chainDetailsMap, null, 2));

  const tokens = await sdk.tokens();
  console.log("Tokens =", JSON.stringify(tokens, null, 2));
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
