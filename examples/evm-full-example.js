const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
const { development } = require("../dist/src/configs/development");
require("dotenv").config();

async function runExample() {
  // sender address
  const fromAddress = process.env.ACCOUNT_ADDRESS;
  // recipient address
  const toAddress = process.env.TO_ACCOUNT_ADDRESS;

  // configure web3
  const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
  const account = web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk(development);

  const tokensInfo = await sdk.getTokensInfo();
  const chains = tokensInfo.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.GRL];
  const sourceTokenInfo = sourceChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "YARO"
  );

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = destinationChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "YARO"
  );

  // authorize the bridge to transfer tokens from sender's address
  await sdk.evmApprove(web3, {
    tokenAddress: sourceTokenInfo.tokenAddress,
    owner: fromAddress,
    spender: sourceChain.bridgeAddress,
  });

  // initiate transfer
  const response = await sdk.send(web3, {
    amount: "1.01",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceChainToken: sourceTokenInfo,
    destinationChainToken: destinationTokenInfo,
    messenger: Messenger.ALLBRIDGE,
  });
  console.log("Tokens sent:", response.txId);
}

runExample();
