import { AllbridgeCoreSdk, Messenger } from "@allbridge/bridge-core-sdk";
import { ensure } from "../../utils/utils";

function msToTime(ms: number) {
  const milliseconds = ms % 1000;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (60 * 1000)) % 60);
  const hours = Math.floor((ms / (3600 * 1000)) % 3600);
  return `${hours === 0 ? "" : hours + ":"}${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }.${milliseconds}`;
}

const main = async () => {
  const sdk = new AllbridgeCoreSdk();

  const tokens = await sdk.tokens();
  const sourceToken = ensure(tokens.find((token) => token.chainSymbol === "ETH" && token.symbol === "USDT"));
  const destinationToken = ensure(tokens.find((token) => token.chainSymbol === "TRX" && token.symbol === "USDT"));

  const transferTimeMs = ensure(sdk.getAverageTransferTime(sourceToken, destinationToken, Messenger.ALLBRIDGE));

  console.log(
    "Average transfer time from %s to %s is %s",
    sourceToken.chainSymbol,
    destinationToken.chainSymbol,
    msToTime(transferTimeMs)
  );
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
