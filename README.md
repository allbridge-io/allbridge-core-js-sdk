<h1 align="center">
   <b>
        <a href="https://core.allbridge.io/"><img src="https://allbridge.io/assets/icons/core.svg" /></a><br>
    </b>
</h1>


<p align="center">
    <a href="https://core.allbridge.io/"><b>Website</b></a> •
    <a href="https://docs-core.allbridge.io"><b>Documentation</b></a> •
    <a href="https://bridge-core-sdk.web.app"><b>SDK TS doc</b></a>
</p> 

# Allbridge Core SDK

Provides an easy integration with the Allbridge Core ChainBridgeService for DApps in the browser or Node.js

## Table of Contents

- [Installing](#installing)
- [How to use](#how-to-use)
  - [1. Initialize SDK instance](#1-initialize-sdk-instance)
  - [2. Get the list of supported tokens](#2-get-the-list-of-supported-tokens)
  - [3.1 Approve the transfer of tokens](#31-approve-the-transfer-of-tokens)
  - [3.2 Send Tokens](#32-send-tokens)
  - [Full example](#full-example)
- [Other operations](#other-operations)
  - [Liquidity Pools operations](#liquidity-pools-operations)
  - [Transaction builder](#transaction-builder)
    - [Approve Transaction](#approve-transaction)
    - [Send Transaction](#send-transaction)
      - [Solana Blockchain](#solana-blockchain)
  - [Get information about sent transaction](#get-information-about-sent-transaction)
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

### Find out how to integrate Allbridge Core SDK and Browser Extension Wallet

[***Evm***](https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/documentation/browser/evm.md)
[***Solana***](https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/documentation/browser/solana.md)
[***Stellar***](https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/documentation/browser/stellar.md)
[***Tron***](https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/documentation/browser/tron.md)

### 1. Initialize SDK

#### 1) Initialize SDK instance with your node Rpc urls (RECOMMENDED)

```ts
import {AllbridgeCoreSdk, nodeRpcUrlsDefault} from "@allbridge/bridge-core-sdk";
// Connections to blockchains will be made through your rpc-urls passed during initialization
const sdk = new AllbridgeCoreSdk({
  ...nodeRpcUrlsDefault,
  TRX: "your trx-rpc-url",
  ETH: "your eth-rpc-url"
});
// Sdk will be using your rpc url for fetch data from blockchain to create tx
const rawTx = await sdk.bridge.rawTxBuilder.send(sendParams);
```

#### 2) Initialize SDK instance (using passed provider for blockchains connections)

@Deprecated use the approach described above

```ts
import {AllbridgeCoreSdk, nodeRpcUrlsDefault} from "@allbridge/bridge-core-sdk";

const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
// The Provider parameter must be passed in order for it to be used to connect to the blockchain, for example:
const rawTx = await sdk.bridge.rawTxBuilder.send(sendParams, provider);
```

***TIP:*** Use 1.1 in case your provider differs from required by the SDK (Web3:v1.9.0, tronweb:v4.4.0)

### 2. Get the list of supported tokens

```ts
const supportedChains = await sdk.chainDetailsMap();
// extract information about ETH chain
const {bridgeAddress, tokens, chainId, name} = supportedChains[ChainSymbol.ETH];
// Choose one of the tokens supported on ETH
const usdtOnEthToken = tokens.find(token => token.symbol === 'USDT');
```

### 3.1 Approve the transfer of tokens (only for Evm, Tron)

Before sending tokens, the bridge has to be authorized to use the tokens of the owner.
This is done by building the `approve` transaction with SDK instance.</p>
For Ethereum USDT - due to specificity of the USDT contract:<br/>
If the current allowance is not 0,
this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.

```ts
const rawTx = await sdk.bridge.rawTxBuilder.approve({
  token: sourceToken,
  owner: accountAddress
});
```

### 3.2 Send Tokens

Initiate the transfer of tokens with `send` method on SDK instance.

```ts
const rawTx = await sdk.bridge.rawTxBuilder.send({
  amount: "1.01",
  fromAccountAddress: fromAddress,
  toAccountAddress: toAddress,
  sourceToken: sourceToken,
  destinationToken: destinationToken,
  messenger: Messenger.ALLBRIDGE,
});
```

### Full example

Swap USDC on ETH chain to USDC on POL chain

```ts
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
} from "@allbridge/bridge-core-sdk";
import Web3 from "web3";
import * as dotenv from "dotenv";
// Utils method
// For more details, see Examples (https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/examples)
// import { getEnvVar } from "../../../utils/env";
// import { sendEvmRawTransaction } from "../../../utils/web3";
// import { ensure } from "../../../utils/utils";

dotenv.config({path: ".env"});

async function runExample() {
    const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS"); // sender address
    const toAddress = getEnvVar("TRX_ACCOUNT_ADDRESS"); // recipient address

    const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });

    const chains = await sdk.chainDetailsMap();

    const sourceChain = chains[ChainSymbol.ETH];
    const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

    const destinationChain = chains[ChainSymbol.POL];
    const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

    const amount = "1.01";

    //check if sending tokens already approved
    if (!(await sdk.bridge.checkAllowance({ token: sourceToken, owner: fromAddress, amount: amount }))) {
      // authorize the bridge to transfer tokens from sender's address
      const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
        token: sourceToken,
        owner: fromAddress,
      })) as RawEvmTransaction;
      const approveTxReceipt = await sendEvmRawTransaction(rawTransactionApprove);
      console.log("Approve tx id:", approveTxReceipt.transactionHash);
    }

    // initiate transfer
    const rawTransactionTransfer = (await sdk.bridge.rawTxBuilder.send({
      amount: amount,
      fromAccountAddress: fromAddress,
      toAccountAddress: toAddress,
      sourceToken: sourceToken,
      destinationToken: destinationToken,
      messenger: Messenger.ALLBRIDGE,
    })) as RawEvmTransaction;
    console.log(`Sending ${amount} ${sourceToken.symbol}`);
    const txReceipt = await sendEvmRawTransaction(rawTransactionTransfer);
    console.log("tx id:", txReceipt.transactionHash);
  }

runExample();
```

***TIP:***
For more details, see [***Examples***](https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/examples)

## Other operations

### Liquidity pools operations

SDK supports operation with **Liquidity Pools**<br/>
For more details, see [
***Examples***](https://github.com/allbridge-io/allbridge-core-js-sdk/tree/main/examples/src/examples/liquidity-pool)

### Transaction builder

#### Approve Transaction

SDK method `bridge.rawTxBuilder.approve` can be used to create approve Transaction.

```ts
const rawTransactionApprove = await sdk.bridge.rawTxBuilder.approve(approveParams);
```

#### Send Transaction

SDK method `bridge.rawTxBuilder.send` can be used to create send Transaction.

```ts
const rawTransactionSend = await sdk.bridge.rawTxBuilder.send(sendParams);
```

**TIP:** </br>
To interact with the **Solana** blockchain: </br>
do not pass provider param </p>

```ts
const transaction = await sdk.bridge.rawTxBuilder.send(sendParams);
```

***TIP:***
For more details, see [***Example
***](https://github.com/allbridge-io/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/solana/sol-build-send-tx.js)

### Get information about sent transaction

SDK method `getTransferStatus` can be used to get information about tokens transfer.

```ts
const transferStatus = await sdk.getTransferStatus(chainSymbol, txId);
```

### Calculating amount of tokens to be received after fee

SDK method `getAmountToBeReceived` can be used to calculate the amount of tokens the receiving party will get after
applying the bridging fee.

```ts
const amountToBeReceived = await sdk.getAmountToBeReceived(
  amountToSend,
  sourceToken,
  destinationToken
);
```

### Calculating amount of tokens to send

SDK method `getAmountToSend` can be used to calculate the amount of tokens to send based on the required amount of
tokens the receiving party should get.

```ts
const amountToSend = await sdk.getAmountToSend(
  amountToBeReceived,
  sourceToken,
  destinationToken
);
```

### Getting the amount of gas fee

The SDK method `getGasFeeOptions` allows to retrieve information about the available methods to pay the gas fee,
as well as the amount of gas fee needed to complete a transfer on the destination chain.
Gas fee is paid during the [send](#32-send-tokens) operation
and can be paid either in the source chain's currency or in source tokens.

The method returns an object with two properties:

- native: The amount of gas fee, denominated in unit of the source chain currency (e.g. wei for Ethereum).
- stablecoin: (optional) The amount of gas fee, denominated in unit of the source token.
  If this property is not present, it indicates that the stablecoin payment method is not available.

```ts
const {native, stablecoin} = await sdk.getGasFeeOptions(
  usdtOnEthToken, // from ETH
  usdtOnTrxToken, // to TRX
  Messenger.ALLBRIDGE
);
console.log(native);
// Output:
// {
//   int: "10000000000000000",
//   float: "0.01" // (0.01 ETH)
// }
console.log(stablecoin);
// Output:
// {
//   int: "10010000",
//   float: "10.01" // (10.01 USDT)
// }
```

### Getting the average transfer time

SDK method `getAverageTransferTime` can be used to get the average time in ms it takes to complete a transfer for a
given combination of tokens and messenger.

```ts
const transferTimeMs = sdk.getAverageTransferTime(
  sourceToken,
  destinationToken,
  Messenger.ALLBRIDGE
);
```
