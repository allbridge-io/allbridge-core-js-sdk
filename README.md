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
- [Creating an Instance](#creating-an-instance)
- [SDK API](#sdk-api)
  - [Approve Tokens](#approve-tokens)
  - [Send Tokens](#send-tokens)
  - [Get Tokens Info](#get-tokens-info)
    - [TokensInfo methods](#tokensinfo-methods)
  - [Calculate Fee percent on source chain](#calculate-fee-percent-on-source-chain)
  - [Calculate Fee percent on destination chain](#calculate-fee-percent-on-destination-chain)
  - [Get amount to be received](#get-amount-to-be-received)
  - [Get amount to send](#get-amount-to-send)
  - [Get amount to be received and tx cost](#get-amount-to-be-received-and-tx-cost)-
  - [Get amount to send and tx cost](#get-amount-to-send-and-tx-cost)
  - [Get average transfer time](#get-average-transfer-time)
  - [Get tx cost](#get-tx-cost)
- [Semver](#semver)

## Installing

Using npm:

```bash
$ npm install @allbridge/bridge-core-sdk
```

Using yarn:

```bash
$ yarn add @allbridge/bridge-core-sdk
```

Using pnpm:

```bash
$ pnpm add @allbridge/bridge-core-sdk
```

### Creating an Instance

Import, examples:

```js
const AllbridgeCoreSdk = require("@allbridge/allbridge-core-sdk");
```

```js
import {AllbridgeCoreSdk} from '@allbridge/allbridge-core-sdk';
```

Initialize the SDK instance:

```js
const sdk = new AllbridgeCoreSdk();
```

### SDK API

#### Approve Tokens

Approve tokens usage by bridge on EVM blockchains for completing transfer

Params:

* web3: Web3 - Web3 provider
* approveData: ApproveData - required data for approving

ApproveData:

```js
{
  /**
   * The token address itself
   */
  tokenAddress: string;
  /**
   *  The address of the owner of the tokens allowing the use of their tokens
   *
   */
  owner: string;
  /**
   *  The address of the contract that we allow to use tokens
   */
  spender: string;
}
```

Returns:

* TransactionResponse - response with completed transaction id

TransactionResponse:

```js
{
  txId: string;
}
```

Example:

```js
const approveData = {
  tokenAddress: tokenAddress,
  owner: accountAddress,
  spender: contractAddress,
};
const response = await sdk.evmApprove(web3, approveData);
```

#### Send Tokens

Send tokens through the bridge

Params:

* web3 - Web3 provider
* sendParams - SendParamsWithChainSymbols | SendParamsWithTokenInfos

##### sendParams init details:

* SendParamsWithChainSymbols:

```js
const sendParams = {
  amount: "1.33",

  fromChainSymbol: ChainSymbol.ETH,
  fromTokenAddress: tokenAddress,
  fromAccountAddress: accountAddress,

  toChainSymbol: ChainSymbol.TRX,
  toTokenAddress: receiveTokenAddress,
  toAccountAddress: accountAddress,

  messenger: Messenger.ALLBRIDGE,
};
```

* SendParamsWithTokenInfos, see [Get Tokens Info](#get-tokens-info):

```js
const sendParams = {
  amount: "1.33",

  fromAccountAddress: fromAccountAddress,
  toAccountAddress: toAccountAddress,

  sourceChainToken: sourceTokenInfoWithChainDetails, // see [Get Tokens Info]
  destinationChainToken: destinationTokenInfoWithChainDetails, // see [Get Tokens Info]

  messenger: Messenger.ALLBRIDGE,
};
```

Returns:

* TransactionResponse - response with completed transaction id

TransactionResponse:

```js
{
  txId: string;
}
```

Example:

```js
const response = await sdk.send(web3, sendParams);
```

#### Get Tokens Info

Fetching information about supported tokens.

Returns:

* TokensInfo - object that contains fetched information about supported tokens.

Example:

```js
const tokensInfo = await sdk.getTokensInfo();
```

##### TokensInfo methods

###### tokens()

Get a list of all supported tokens

Returns:

* TokenInfoWithChainDetails[]

Example:

```js
const tokens = tokensInfo.tokens();
```

###### tokensByChain(chainSymbol: ChainSymbol)

Params:

* chainSymbol: ChainSymbol

Returns:

* TokenInfoWithChainDetails[] - a list of supported tokens on the given blockchain

Example:

```js
const tokensOnTRX = tokensInfo.tokensByChain(ChainSymbol.TRX);
```

TokenInfoWithChainDetails:

```js
{
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  poolInfo: PoolInfo;
  feeShare: string;
  apr: number;
  lpRate: number;
  // Chain symbol
  chainSymbol: string;
  // Chain ID according to EIP-155 
  chainId ?: string; // A 0x-prefixed hexadecimal string
  // Chain name
  chainName: string;

  allbridgeChainId: number;
  bridgeAddress: string;
  txTime: TxTime;
  confirmations: number;
}
```

#### Calculate Fee percent on source chain

Calculates the percentage of fee from the initial amount that is charged when swapping from the selected source chain.

Params:

* amountFloat: string | number | Big - initial amount of tokens to swap
* sourceChainToken: TokenInfo - the source chain token info, see [Get Tokens Info](#get-tokens-info)

Returns:

* number - The percentage of fee

Example:

```js
 const sourceFeePercent = sdk.calculateFeePercentOnSourceChain(
  amount,
  sourceToken
);
```

#### Calculate Fee percent on destination chain

Calculates the percentage of fee that is charged when swapping to the selected destination chain. The destination chain
fee percent applies to the amount after the source chain fee.

Params:

* amountFloat: string | number | Big - initial amount of tokens to swap
* sourceChainToken: TokenInfo - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfo - the destination chain token info

Returns:

* number - The percentage of fee

Example:

```js
const destinationFeePercent = sdk.calculateFeePercentOnDestinationChain(
  amount,
  sourceToken,
  destinationToken
);
```

#### Get amount to be received

Calculates the amount of tokens the receiving party will get as a result of the swap.

Params:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that will be sent
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)

Returns:

* string - The amount to send

Example:

```js
const amountToBeReceived = sdk.getAmountToBeReceived(
  amount,
  sourceToken,
  destinationToken
);
```

#### Get amount to send

Calculates the amount of tokens to send based on the required amount of tokens the receiving party should get as a
result of the swap.

Params:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that should be received
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)

Returns:

* string - The amount to send

Example:

```js
const amountToSend = sdk.getAmountToSend(
  amount,
  sourceToken,
  destinationToken
);
```

#### Get amount to be received and tx cost

See [Get amount to be received](#get-amount-to-be-received), [Get tx cost](#get-tx-cost)

Params:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that will be sent
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

Returns:

* AmountsAndTxCost:

```js
{
  /**
   * The amount of tokens to be sent.
   */
  amountToSendFloat: string;

  /**
   * The amount of tokens to be received.
   */
  amountToBeReceivedFloat: string;

  /**
   * The amount of gas fee to pay for the transfer in the smallest denomination of the source chain currency.
   */
  txCost: string;
}
``` 

Example:

```js
const {amountToSendFloat, amountToBeReceivedFloat, txCost} =
  await sdk.getAmountToBeReceivedAndTxCost(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
```

#### Get amount to send and tx cost

See [Get amount to send](#get-amount-to-send), [Get tx cost](#get-tx-cost)

Params:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that should be received
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

Returns:

* AmountsAndTxCost:

```js
{
  /**
   * The amount of tokens to be sent.
   */
  amountToSendFloat: string;

  /**
   * The amount of tokens to be received.
   */
  amountToBeReceivedFloat: string;

  /**
   * The amount of gas fee to pay for the transfer in the smallest denomination of the source chain currency.
   */
  txCost: string;
}
``` 

Example:

```js
const {amountToSendFloat, amountToBeReceivedFloat, txCost} =
  await sdk.getAmountToSendAndTxCost(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
```

#### Get average transfer time

Gets the average time in ms to complete a transfer for given tokens and messenger.

Params:

* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

Returns:

* null | number - Average transfer time in milliseconds or null if given combination of tokens and messenger is not
  supported.

Example:

```js
const transferTimeMs = sdk.getAverageTransferTime(
  sourceToken,
  destinationToken,
  Messenger.ALLBRIDGE
);
```

#### Get tx cost

Fetches the amount of units in source chain currency to pay for the transfer.

Params:

* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

Returns:

* string - The amount of gas fee to pay for transfer in the smallest denomination of the source chain currency.

Example:

```js
const txCost = await sdk.getTxCost(
  sourceTokenInfoWithChainDetails,
  destinationTokenInfoWithChainDetails,
  Messenger.ALLBRIDGE
);
```

## Semver

Until bridge-core-sdk reaches a `1.0.0` release, breaking changes will be released with a new minor version. For
example `0.3.1`, and `0.3.4` will have the same API, but `0.4.0` will have breaking changes.
