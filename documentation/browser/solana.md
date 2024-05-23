
# Integrating Allbridge Core SDK and Browser Extension Wallet with TypeScript

## Introduction
This documentation provides a step-by-step guide on integrating the Allbridge Core SDK and a browser extension wallet (Phantom Wallet) using TypeScript in a web project.

## Prerequisites
- TypeScript
- Node.js
- npm or yarn
- Allbridge Core SDK package installed ([`@allbridge/bridge-core-sdk`](https://www.npmjs.com/package/@allbridge/bridge-core-sdk))
- Web3.js library (`@solana/web3.js`)
- Phantom Wallet extension installed in the browser. [Docs](https://docs.phantom.app/)

## Installation
First, install the necessary packages:

```bash
npm install @allbridge/bridge-core-sdk @solana/web3.js
```

## Step-by-Step Integration

### Step 1: Import Necessary Modules

Import the required modules and initialize the Allbridge Core SDK:

```typescript
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  NodeRpcUrls,
  SendParams,
} from '@allbridge/bridge-core-sdk';
import { VersionedTransaction } from '@solana/web3.js';
```

### Step 2: Define Node URLs and initialize SDK

Set up the node URLs for the different chains and initialize the Allbridge Core SDK.

```typescript
const SDK_NODE_URLS: NodeRpcUrls = {
  [ChainSymbol.SOL]: 'https://rpc.ankr.com/solana',
};
const sdk = new AllbridgeCoreSdk(SDK_NODE_URLS);
```

### Step 3: Create, sign and send Allbridge raw transaction:

```typescript
const rawTransaction = (await sdk.bridge.rawTxBuilder.send(params)) as VersionedTransaction;
const { signature } = await window.solana.signAndSendTransaction(rawTransaction);
console.log('txId', signature);
```

## Conclusion

With this guide, you have set up the Allbridge Core SDK and Phantom wallet integration on your web application using TypeScript. You can now securely send transactions and check their status on the Solana blockchain. For further customization and advanced usage, refer to the official documentation of the respective SDKs.
