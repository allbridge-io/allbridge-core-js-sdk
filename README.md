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
- [Example](#example)
  - [Creating an Instance](#creating-an-instance)
  - [SDK API](#sdk-api)
    - [Get Tokens Info](#get-tokens-info)
    - [Approve Tokens](#approve-tokens)
    - [Send Tokens](#send-tokens)
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

## Examples

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

#### Get Tokens Info

Fetches information about the supported tokens from the Allbridge Core.

returns:

* tokensInfo - collected information about the supported tokens

```js
const tokensInfo = await sdk.getTokensInfo();
```

#### Approve Tokens

Approve tokens usage by bridge on EVM blockchains for completing transfer

* web3 - Web3 provider
* tokenAddress - the token address itself
* owner - the address of the owner of the tokens allowing the use of their tokens
* spender - the address of the contract that we allow to use tokens

returns:

* txId - completed transaction id

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

* SendParamsWithTokenInfos, look [Get Tokens Info](#get-tokens-info):

```js
const sendParams = {
  amount: "1.33",

  fromAccountAddress: fromAccountAddress,
  toAccountAddress: toAccountAddress,

  sourceChainToken: tokenInfoWithChainDetails, // see [Get Tokens Info]
  destinationChainToken: tokenInfoWithChainDetails,

  messenger: Messenger.ALLBRIDGE,
};
```

returns:

* txId - completed transaction id

```js
const response = await sdk.send(web3, sendParams);
```

## Semver

Until bridge-core-sdk reaches a `1.0.0` release, the module is treated as beta.
