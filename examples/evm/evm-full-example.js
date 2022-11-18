const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config({ path: "../.env" });

async function runExample() {
  // sender address
  const fromAddress = process.env.ETH_ACCOUNT_ADDRESS;
  // recipient address
  const toAddress = process.env.TRX_ACCOUNT_ADDRESS;

  // configure web3
  const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
  const account = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();

  // fetch information about supported chains
  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.BSC];
  const sourceTokenInfo = sourceChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "BUSD"
  );

  const destinationChain = chains[ChainSymbol.TRX];
  const destinationTokenInfo = destinationChain.tokens.find(
    (tokenInfo) => tokenInfo.symbol === "USDT"
  );

  if (
    //check if sending tokens already approved
    !(await sdk.checkAllowance(web3, {
      chainSymbol: ChainSymbol.BSC,
      tokenAddress: sourceTokenInfo.tokenAddress,
      owner: fromAddress,
      amount: "1.01",
    }))
  ) {
    // authorize a transfer of tokens from sender's address
    await sdk.approve(web3, {
      tokenAddress: sourceTokenInfo.tokenAddress,
      owner: fromAddress,
      spender: sourceTokenInfo.poolAddress,
    });
  }

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
