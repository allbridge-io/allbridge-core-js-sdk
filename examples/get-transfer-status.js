const { AllbridgeCoreSdk, ChainSymbol } = require("@allbridge/bridge-core-sdk");
require("dotenv").config();

async function runExample() {
  const txId = process.env.SENT_TX_ID;
  const chainSymbol = ChainSymbol.TRX; // example, must correspond to SENT_TX_ID blockchain

  const sdk = new AllbridgeCoreSdk();

  const sendStatus = await sdk.getTransferStatus(chainSymbol, txId);

  console.log("Send Status: ", sendStatus);
}

runExample();
