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
  - [1. Initialize SDK instance](#1-initialize-sdk)
  - [2. Get the list of supported tokens](#2-get-the-list-of-supported-tokens)
  - [3. Choose a messenger](#3-choose-a-messenger)
    - [CCTP and CCTP V2](#cctp-and-cctp-v2)
    - [OFT](#oft)
    - [X_RESERVE](#x_reserve)
  - [4.1 Approve the transfer of tokens](#41-approve-the-transfer-of-tokens-only-for-evm-tron)
  - [4.2 Send Tokens](#42-send-tokens)
  - [Full example](#full-example)
- [Other operations](#other-operations)
  - [Transaction builder](#transaction-builder)
    - [Approve Transaction](#approve-transaction)
    - [Send Transaction](#send-transaction)
  - [Get information about sent transaction](#get-information-about-sent-transaction)
  - [Calculating amount of tokens to be received after fee](#calculating-amount-of-tokens-to-be-received-after-fee)
  - [Calculating amount of tokens to send](#calculating-amount-of-tokens-to-send)
  - [Getting the amount of gas fee](#getting-the-amount-of-gas-fee)
  - [Getting the maximum amount of extra gas](#getting-the-maximum-amount-of-extra-gas)
  - [Getting the average transfer time](#getting-the-average-transfer-time)
- [Known Audit Warning](#known-audit-warning)

## Installing

```bash
$ npm install @allbridge/bridge-core-sdk
```

## How to use

### Find out how to integrate Allbridge Core SDK and Browser Extension Wallet

[***Evm***](https://github.com/allbridge-public/allbridge-core-js-sdk/tree/main/documentation/browser/evm.md)
[***Solana***](https://github.com/allbridge-public/allbridge-core-js-sdk/tree/main/documentation/browser/solana.md)
[***Stellar***](https://github.com/allbridge-public/allbridge-core-js-sdk/tree/main/documentation/browser/stellar.md)
[***Tron***](https://github.com/allbridge-public/allbridge-core-js-sdk/tree/main/documentation/browser/tron.md)

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

```ts
import {AllbridgeCoreSdk, nodeRpcUrlsDefault} from "@allbridge/bridge-core-sdk";

const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);
// The Provider parameter must be passed in order for it to be used to connect to the blockchain, for example:
const rawTx = await sdk.bridge.rawTxBuilder.send(sendParams, provider);
```

***TIP:*** tested and developed for (Web3:v1.9.0, tronweb:v4.4.0), in other case use approach 1)

### 2. Get the list of supported tokens

```ts
const supportedChains = await sdk.chainDetailsMap();
// extract information about ETH chain
const {tokens, chainId, name, oftBridgeAddress} = supportedChains[ChainSymbol.ETH];
// Choose one of the tokens supported on ETH
const usdcOnEthToken = tokens.find(token => token.symbol === 'USDC');
```

Every token is returned as a `TokenWithChainDetails` object. Besides the general token data (`symbol`, `name`,
`decimals`, `tokenAddress`) it contains everything needed to find out which messengers the token can be sent with:

| Field                             | Present when                       | Meaning                                                                          |
|-----------------------------------|------------------------------------|----------------------------------------------------------------------------------|
| `cctpAddress`, `cctpFeeShare`     | token is supported by CCTP         | CCTP bridge contract address (the approve spender) and CCTP fee share            |
| `cctpV2Address`, `cctpV2FeeShare` | token is supported by CCTP V2      | CCTP V2 bridge contract address (the approve spender) and CCTP V2 fee share      |
| `oftId`, `oftBridgeAddress`       | token / chain is supported by OFT  | Id shared by the same token on different chains, OFT bridge contract address     |
| `xReserve`                        | token is supported by xReserve     | xReserve bridge contract address (the approve spender), `feeShare` and `feeConst` |
| `transferTime`                    | always                             | Average transfer time to other chains, per messenger                             |
| `abrPayer`                        | chain supports paying fees in ABR  | ABR payer contract address and per-messenger availability                        |

### 3. Choose a messenger

Every transfer is executed by one of the supported messengers (bridging protocols).
The messenger is a required parameter of all route-dependent SDK methods:
`bridge.checkAllowance`, `bridge.rawTxBuilder.approve`, `bridge.rawTxBuilder.send`, `getAmountToBeReceived`,
`getAmountToSend`, `getGasFeeOptions`, `getExtraGasMaxLimits` and `getAverageTransferTime`.

| Messenger             | Protocol       | Route is supported when                                                                                |
|-----------------------|----------------|--------------------------------------------------------------------------------------------------------|
| `Messenger.CCTP`      | Circle CCTP    | `cctpAddress` is defined on both source and destination tokens                                         |
| `Messenger.CCTP_V2`   | Circle CCTP V2 | `cctpV2Address` is defined on both source and destination tokens                                       |
| `Messenger.OFT`       | LayerZero OFT  | `oftId` is the same on source and destination tokens and `oftBridgeAddress` is defined on both chains  |
| `Messenger.X_RESERVE` | xReserve       | `xReserve` is defined on both source and destination tokens                                            |

`Messenger.ALLBRIDGE` and `Messenger.WORMHOLE` are deprecated and must not be used.

```ts
import {Messenger} from "@allbridge/bridge-core-sdk";

function getAvailableMessengers(sourceToken: TokenWithChainDetails, destinationToken: TokenWithChainDetails): Messenger[] {
  const messengers: Messenger[] = [];
  if (sourceToken.cctpAddress && destinationToken.cctpAddress) {
    messengers.push(Messenger.CCTP);
  }
  if (sourceToken.cctpV2Address && destinationToken.cctpV2Address) {
    messengers.push(Messenger.CCTP_V2);
  }
  if (
    sourceToken.oftId &&
    sourceToken.oftId === destinationToken.oftId &&
    sourceToken.oftBridgeAddress &&
    destinationToken.oftBridgeAddress
  ) {
    messengers.push(Messenger.OFT);
  }
  if (sourceToken.xReserve && destinationToken.xReserve) {
    messengers.push(Messenger.X_RESERVE);
  }
  return messengers;
}
```

`getAverageTransferTime` returns `null` when the messenger is not available between the source and destination chains,
so it can be used as an additional check. If a messenger is not supported for the chosen route, the SDK methods throw
`CCTPDoesNotSupportedError`, `OFTDoesNotSupportedError` or `SdkError` (for xReserve).

***TIP:***
For more details, see [***Example***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/get-available-messengers.ts)

#### CCTP and CCTP V2

Native USDC transfers through Circle CCTP.
The bridge contract that has to be approved is `token.cctpAddress` (CCTP) or `token.cctpV2Address` (CCTP V2).
The fee is a share of the transferred amount, see `token.cctpFeeShare` / `token.cctpV2FeeShare`;
use [`getAmountToBeReceived`](#calculating-amount-of-tokens-to-be-received-after-fee) to get the exact result.

Examples:
[***EVM (CCTP)***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/send-by-cctp.ts),
[***EVM (CCTP V2)***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/evm/evm-build-send-tx.ts),
[***EVM (CCTP V2, gas fee paid with stablecoin)***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/evm/evm-build-send-tx-gas-fee-with-stables.ts),
[***Solana***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/solana/sol-build-send-tx-cctp.ts),
[***Sui***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/sui/sui-build-send-tx.ts)

#### OFT

Transfers through LayerZero OFT. Tokens on different chains are linked by `token.oftId`.
The bridge contract that has to be approved is `oftBridgeAddress` of the source chain.
The fee share is provided by the Allbridge Core API for the route,
use [`getAmountToBeReceived`](#calculating-amount-of-tokens-to-be-received-after-fee) to get the exact result.

Examples:
[***Tron***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/trx/trx-build-send-tx.ts),
[***Tron (gas fee paid with stablecoin)***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/trx/trx-build-send-tx-gas-fee-with-stables.ts)

#### X_RESERVE

Transfers through the xReserve protocol. The route configuration is in `token.xReserve`:
`bridgeAddress` is the contract that has to be approved, `feeShare` and `feeConst` describe the fee.
Because of the constant part of the fee there is a minimum transfer amount;
`getAmountToBeReceived` throws an `SdkError` with the minimum amount if the amount is too low.
Extra gas is not supported by this messenger: `getExtraGasMaxLimits` returns zero limits.

Examples:
[***Stacks***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/stx/stx-build-send-tx.ts)

### 4.1 Approve the transfer of tokens (only for Evm, Tron)

Before sending tokens, the bridge has to be authorized to use the tokens of the owner.
This is done by building the `approve` transaction with SDK instance.
The spender depends on the messenger, so the `messenger` parameter is required.</p>
For Ethereum USDT - due to specificity of the USDT contract:<br/>
If the current allowance is not 0,
this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.

```ts
const rawTx = await sdk.bridge.rawTxBuilder.approve({
  token: sourceToken,
  owner: accountAddress,
  messenger: Messenger.CCTP_V2,
});
```

Use `bridge.checkAllowance` to find out whether the approval is already enough:

```ts
const isApproved = await sdk.bridge.checkAllowance({
  token: sourceToken,
  owner: accountAddress,
  amount: "1.01",
  messenger: Messenger.CCTP_V2,
});
```

### 4.2 Send Tokens

Initiate the transfer of tokens with `send` method on SDK instance.

```ts
const rawTx = await sdk.bridge.rawTxBuilder.send({
  amount: "1.01",
  fromAccountAddress: fromAddress,
  toAccountAddress: toAddress,
  sourceToken: sourceToken,
  destinationToken: destinationToken,
  messenger: Messenger.CCTP_V2,
});
```

### Full example

Swap USDC on ETH chain to USDC on ARB chain using CCTP V2

```ts
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  Messenger,
  nodeRpcUrlsDefault,
  RawEvmTransaction,
} from "@allbridge/bridge-core-sdk";
import * as dotenv from "dotenv";
// Utils method
// For more details, see Examples (https://github.com/allbridge-public/allbridge-core-js-sdk/tree/main/examples)
// import { getEnvVar } from "../../../utils/env";
// import { sendEvmRawTransaction } from "../../../utils/web3";
// import { ensure } from "../../../utils/utils";

dotenv.config({path: ".env"});

async function runExample() {
  const fromAddress = getEnvVar("ETH_ACCOUNT_ADDRESS"); // sender address
  const toAddress = getEnvVar("ARB_ACCOUNT_ADDRESS"); // recipient address

  const sdk = new AllbridgeCoreSdk({ ...nodeRpcUrlsDefault, ETH: getEnvVar("WEB3_PROVIDER_URL") });

  const chains = await sdk.chainDetailsMap();

  const sourceChain = chains[ChainSymbol.ETH];
  const sourceToken = ensure(sourceChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const destinationChain = chains[ChainSymbol.ARB];
  const destinationToken = ensure(destinationChain.tokens.find((tokenInfo) => tokenInfo.symbol === "USDC"));

  const amount = "1.01";
  const messenger = Messenger.CCTP_V2;

  //check if sending tokens already approved
  if (!(await sdk.bridge.checkAllowance({ token: sourceToken, owner: fromAddress, amount, messenger }))) {
    // authorize the bridge to transfer tokens from sender's address
    const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
      token: sourceToken,
      owner: fromAddress,
      messenger,
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
    messenger,
  })) as RawEvmTransaction;
  console.log(`Sending ${amount} ${sourceToken.symbol}`);
  const txReceipt = await sendEvmRawTransaction(rawTransactionTransfer);
  console.log("tx id:", txReceipt.transactionHash);
}

runExample();
```

***TIP:***
For more details, see [***Examples***](https://github.com/allbridge-public/allbridge-core-js-sdk/tree/main/examples)

## Other operations

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

***TIP:***
For more details, see [***Example
***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/solana/sol-build-send-tx-cctp.ts)

### Get information about sent transaction

SDK method `getTransferStatus` can be used to get information about tokens transfer.

```ts
const transferStatus = await sdk.getTransferStatus(chainSymbol, txId);
```

### Calculating amount of tokens to be received after fee

SDK method `getAmountToBeReceived` can be used to calculate the amount of tokens the receiving party will get after
applying the bridging fee of the chosen messenger.

```ts
const amountToBeReceived = await sdk.getAmountToBeReceived(
  amountToSend,
  sourceToken,
  destinationToken,
  Messenger.CCTP_V2
);
```

### Calculating amount of tokens to send

SDK method `getAmountToSend` can be used to calculate the amount of tokens to send based on the required amount of
tokens the receiving party should get.

```ts
const amountToSend = await sdk.getAmountToSend(
  amountToBeReceived,
  sourceToken,
  destinationToken,
  Messenger.CCTP_V2
);
```

***TIP:***
For more details, see [***Example***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/calculate-amounts.ts)

### Getting the amount of gas fee

The SDK method `getGasFeeOptions` allows to retrieve information about the available methods to pay the gas fee,
as well as the amount of gas fee needed to complete a transfer on the destination chain.
Gas fee is paid during the [send](#42-send-tokens) operation
and can be paid either in the source chain's currency, in source tokens or in ABR tokens
(see `gasFeePaymentMethod` in `SendParams`).

The method returns an object with the following properties:

- native: The amount of gas fee, denominated in unit of the source chain currency (e.g. wei for Ethereum).
- stablecoin: (optional) The amount of gas fee, denominated in unit of the source token.
  If this property is not present, it indicates that the stablecoin payment method is not available.
- abr: (optional) The amount of gas fee, denominated in unit of the ABR token.
  Present only if the source chain has `abrPayer` and the chosen messenger is available for ABR payments.

```ts
const {native, stablecoin, abr} = await sdk.getGasFeeOptions(
  usdcOnEthToken, // from ETH
  usdcOnArbToken, // to ARB
  Messenger.CCTP_V2
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
//   float: "10.01" // (10.01 USDC)
// }
```

### Getting the maximum amount of extra gas

Extra gas is an additional amount of the destination chain currency that can be delivered together with the transfer
(see `extraGas` in `SendParams`). SDK method `getExtraGasMaxLimits` returns the maximum extra gas value for every
gas fee payment method, as well as the maximum amount that can be received on the destination chain.

```ts
const extraGasLimits = await sdk.getExtraGasMaxLimits(
  sourceToken,
  destinationToken,
  Messenger.CCTP_V2
);
```

***TIP:***
For more details, see [***Example***](https://github.com/allbridge-public/allbridge-core-js-sdk/blob/main/examples/src/examples/bridge/get-extra-gas-max-limits.ts)

### Getting the average transfer time

SDK method `getAverageTransferTime` can be used to get the average time in ms it takes to complete a transfer for a
given combination of tokens and messenger. Returns `null` if the messenger is not supported for the route.

```ts
const transferTimeMs = sdk.getAverageTransferTime(
  sourceToken,
  destinationToken,
  Messenger.CCTP_V2
);
```

### Known Audit Warning

Due to a dependency on `@solana/web3.js`, the package `bigint-buffer@1.1.5` is present in the dependency tree and marked as vulnerable.
This vulnerability is not exploitable in the context of this SDK, and no sensitive or user-facing code depends on `bigint-buffer` directly.

We are monitoring upstream packages for an official resolution.
