const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const bs58 = require("bs58");

const solanaWeb3 = require("@solana/web3.js");
const { sendAndConfirmTransaction } = require("@solana/web3.js");
require("dotenv").config({ path: "../.env" });

const fromAddress = process.env.SOL_ACCOUNT_ADDRESS;
const privateKey = process.env.SOL_PRIVATE_KEY;
const toAddressEth = process.env.ETH_ACCOUNT_ADDRESS;
const toAddressTrx = process.env.TRX_ACCOUNT_ADDRESS;

async function runExampleViaWormhole() {
  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = sourceChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDC"
  );

  const destinationChainEth = chains[ChainSymbol.ETH];
  const destinationTokenInfoEth = destinationChainEth.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDT"
  );

  // initiate transfer using Messenger.WORMHOLE
  const { transaction, signer } = await sdk.rawTransactionBuilder.send({
    amount: "0.7",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressEth,
    sourceChainToken: sourceTokenInfo,
    destinationChainToken: destinationTokenInfoEth,
    messenger: Messenger.WORMHOLE,
  });

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));

  let connection = new solanaWeb3.Connection(
    sdk.params.solanaRpcUrl,
    "confirmed"
  );
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    keypair,
    signer,
  ]);

  console.log("Signature via WORMHOLE:", signature);
}

async function runExampleViaAllbridge() {
  const sdk = new AllbridgeCoreSdk();

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.SOL];
  const sourceTokenInfo = sourceChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDC"
  );

  const destinationChainTrx = chains[ChainSymbol.TRX];
  const destinationTokenInfoTrx = destinationChainTrx.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDT"
  );

  // initiate transfer using Messenger.ALLBRIDGE
  const { transaction } = await sdk.rawTransactionBuilder.send({
    amount: "0.7",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddressTrx,
    sourceChainToken: sourceTokenInfo,
    destinationChainToken: destinationTokenInfoTrx,
    messenger: Messenger.ALLBRIDGE,
  });

  const keypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(privateKey));

  let connection = new solanaWeb3.Connection(
    sdk.params.solanaRpcUrl,
    "confirmed"
  );
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    keypair,
  ]);

  console.log("Signature via ALLBRIDGE:", signature);
}

runExampleViaWormhole();
runExampleViaAllbridge();
