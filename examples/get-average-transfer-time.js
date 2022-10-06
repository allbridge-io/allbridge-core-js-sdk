const {
  AllbridgeCoreSdk,
  production,
  Messenger,
} = require("@allbridge/allbridge-core-sdk");

function msToTime(ms) {
  const milliseconds = ms % 1000;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (60 * 1000)) % 60);
  const hours = Math.floor((ms / (3600 * 1000)) % 3600);
  return `${hours === 0 ? "" : hours + ":"}${
    minutes < 10 ? "0" + minutes : minutes
  }:${seconds < 10 ? "0" + seconds : seconds}.${milliseconds}`;
}

async function runExample() {
  const sdk = new AllbridgeCoreSdk(production);

  const tokensInfo = await sdk.getTokensInfo();

  const tokens = tokensInfo.tokens();
  const sourceToken = tokens[0];
  const destinationToken = tokens[tokens.length - 1];

  const transferTimeMs = sdk.getAverageTransferTime(
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );

  console.log(
    "Average transfer time from %s to %s is %s",
    sourceToken.chainSymbol,
    destinationToken.chainSymbol,
    msToTime(transferTimeMs)
  );
}

runExample();
