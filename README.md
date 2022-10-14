<h1 align="center">
   <b>
        <a href="https://core.allbridge.io/"><img src="https://core.allbridge.io/assets/icons/logo.svg" /></a><br>
    </b>
</h1>


<p align="center">
    <a href="https://core.allbridge.io/"><b>Website</b></a> •
    <a href="https://docs-core.allbridge.io"><b>Documentation</b></a>
</p> 

# Allbridge Core SDK

Provides an easy integration with the Allbridge Core Bridge for DApps in the browser or Node.js

## Table of Contents

- [Installing](#installing)
- [How to use](#how-to-use)
  - [1. Initialize SDK instance](#1-initialize-sdk-instance)
  - [2. Get the list of supported tokens](#2-get-the-list-of-supported-tokens)
  - [3.1 Approve the transfer of tokens](#31-approve-the-transfer-of-tokens)
  - [3.2 Send Tokens](#32-send-tokens)
  - [Full example](#full-example)
- [Other operations](#other-operations)
  - [Calculating amount of tokens to be received after fee](#calculating-amount-of-tokens-to-be-received-after-fee)
  - [Calculating amount of tokens to send](#calculating-amount-of-tokens-to-send)
  - [Getting the amount of gas fee](#getting-the-amount-of-gas-fee)
  - [Getting the average transfer time](#getting-the-average-transfer-time)
- [Semver](#semver)

## Installing

```bash
$ npm install @allbridge/bridge-core-sdk
```
## How to use

### 1. Initialize SDK instance

```js
const AllbridgeCoreSdk = require('@allbridge/allbridge-core-sdk');
const sdk = new AllbridgeCoreSdk();
```

### 2. Get the list of supported tokens

```js
const tokensInfo = await sdk.getTokensInfo();
const supportedChains = tokensInfo.chainDetailsMap();
// extract information about ETH chain
const {bridgeAddress, tokens, chainId, name} = supportedChains[ChainSymbol.ETH];
// Choose one of the tokens supported on ETH
const usdtOnEthTokenInfo = tokens.find(tokensInfo => tokensInfo.symbol === 'USDT');
```

### 3.1 Approve the transfer of tokens 

Before sending tokens the bridge has to be authorized to use user's tokens. This is done by calling the `evmApprove` method on SDK instance.

```js
const response = await sdk.evmApprove(web3, {
  tokenAddress: tokenAddress,
  owner: senderAddress,
  spender: bridgeAddress,
});
```

### 3.2 Send Tokens

Initiate the transfer of tokens with `send` method on SDK instance.

```js
await sdk.send(web3, {
  amount: '1.01',
  fromAccountAddress: senderAddress,
  sourceChainToken: usdtOnEthTokenInfo,
  toAccountAddress: recipientAddress,
  destinationChainToken: usdtOnTrxTokenInfo,
  messenger: Messenger.ALLBRIDGE,
});
```

### Full example
Swap BUSD on BSC chain to USDT on TRX chain

```js
const {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} = require("@allbridge/bridge-core-sdk");
const Web3 = require("web3");
require("dotenv").config();

async function runExample() {
  // sender address
  const fromAddress = '0x01234567890abcdef01234567890abcdef012345';
  // recipient address
  const toAddress = 'AbcDefGHIJklmNoPQRStuvwXyz1aBcDefG';

  // configure web3
  const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
  const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  const sdk = new AllbridgeCoreSdk();

  // fetch information about supported chains
  const tokensInfo = await sdk.getTokensInfo();
  const chains = tokensInfo.chainDetailsMap();

  const bscChain = chains[ChainSymbol.BSC];
  const busdTokenInfo = bscChain.tokens.find(tokenInfo => tokenInfo.symbol === 'BUSD');

  const trxChain = chains[ChainSymbol.TRX];
  const usdtTokenInfo = trxChain.tokens.find(tokenInfo => tokenInfo.symbol === 'USDT');

  // authorize the bridge to transfer tokens from sender's address
  await sdk.evmApprove(web3, {
    tokenAddress: busdTokenInfo.tokenAddress,
    owner: fromAddress,
    spender: bscChain.bridgeAddress,
  });

  // initiate transfer
  const response = await sdk.send(web3, {
    amount: "1.01",
    fromAccountAddress: fromAddress,
    toAccountAddress: toAddress,
    sourceChainToken: busdTokenInfo,
    destinationChainToken: usdtTokenInfo,
    messenger: Messenger.ALLBRIDGE,
  });
  console.log("Tokens sent:", response.txId);
}

runExample();
```

## Other operations

### Calculating amount of tokens to be received after fee 

SDK method `getAmountToBeReceived` can be used to calculate the amount of tokens the receiving party will get after applying the bridging fee.

```js
const amountToBeReceived = sdk.getAmountToBeReceived(
  amountToSend,
  sourceTokenInfo,
  destinationTokenInfo
);
```

### Calculating amount of tokens to send

SDK method `getAmountToSend` can be used to calculate the amount of tokens to send based on the required amount of tokens the receiving party should get.

```js
const amountToSend = sdk.getAmountToSend(
  amountToBeReceived,
  sourceTokenInfo,
  destinationTokenInfo
);
```

### Getting the amount of gas fee

SDK method `getTxCost` can be used to fetch information about the amount of gas fee required to complete the transfer on the destination chain. Gas fee is paid during the [send](#32-send-tokens) operation in the source chain currency.

```js
const weiValue = await sdk.getTxCost(
  usdtOnEthTokenInfo, // from ETH
  usdtOnTrxTokenInfo, // to TRX
  Messenger.ALLBRIDGE
);
```

### Getting the average transfer time

SDK method `getAverageTransferTime` can be used to get the average time in ms it takes to complete a transfer for a given combination of tokens and messenger.

```js
const transferTimeMs = sdk.getAverageTransferTime(
  sourceTokenInfo,
  destinationTokenInfo,
  Messenger.ALLBRIDGE
);
```

## Semver

Until bridge-core-sdk reaches a `1.0.0` release, breaking changes will be released with a new minor version. For example `0.3.1`, and `0.3.4` will have the same API, but `0.4.0` will have breaking changes.
