
# Integrating Allbridge Core SDK and Browser Extension Wallet with TypeScript

## Introduction
This documentation provides a step-by-step guide on integrating the Allbridge Core SDK and a browser extension wallet (MetaMask and WalletConnect) using TypeScript in a web project.

## Prerequisites
- TypeScript
- Node.js
- npm or yarn
- Allbridge Core SDK package installed ([`@allbridge/bridge-core-sdk`](https://www.npmjs.com/package/@allbridge/bridge-core-sdk))
- WalletConnect Provider (`@walletconnect/ethereum-provider`). [Docs](https://docs.walletconnect.com/)
- Web3.js library (`web3, web3-core`)
- MetaMask extension installed in the browser. [Docs](https://docs.metamask.io/)

## Installation
First, install the necessary packages:

```bash
npm install @allbridge/bridge-core-sdk @walletconnect/ethereum-provider web3
```

## Step-by-Step Integration

### Step 1: Import Necessary Modules

Import the required modules and initialize the Allbridge Core SDK:

```typescript
import {
  AllbridgeCoreSdk,
  NodeRpcUrls,
  RawEvmTransaction,
  SendParams,
} from '@allbridge/bridge-core-sdk';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';
import EthereumProvider from '@walletconnect/ethereum-provider';
```

### Step 2: Define Node URLs and initialize SDK

Specifying nodes for EVM networks is optional, but can be done according to the `NodeRpcUrls` type:

```typescript
const SDK_NODE_URLS: NodeRpcUrls = {};
const sdk = new AllbridgeCoreSdk(SDK_NODE_URLS);
```

### Step 3: Define Web3

Define Web3 if you are using the MetaMask wallet:

```typescript
const web3: Web3 = new Web3(window.ethereum);
```

Define Web3 if you are using the WalletConnect protocol:

```typescript
const provider = await EthereumProvider.init({
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID',
  methods: ['eth_sendTransaction'],
  optionalChains: [chainId],
  showQrModal: true,
});
await provider.enable();
const web3 = new Web3(provider as AbstractProvider);
```

### Step 4: Create, sign and send Allbridge raw transaction:

```typescript
const rawTransaction = (await sdk.bridge.rawTxBuilder.send(params)) as RawEvmTransaction;
const gasLimit = await web3.eth.estimateGas(rawTransaction);
const signedTx = await web3.eth.sendTransaction({
  ...rawTransaction,
  gas: gasLimit,
});
const txId = signedTx.transactionHash;
console.log('txId', txId);
```

## Conclusion

With this guide, you have set up the Allbridge Core SDK and MetaMask wallet or WalletConnect protocol integration on your web application using TypeScript. You can now securely send transactions and check their status on the explorer. For further customization and advanced usage, refer to the official documentation of the respective SDKs.
