
# Integrating Allbridge Core SDK and Browser Extension Wallet with TypeScript

## Introduction
This documentation provides a step-by-step guide on integrating the Allbridge Core SDK and a browser extension wallet (TronLink) using TypeScript in a web project.

## Prerequisites
- TypeScript
- Node.js
- npm or yarn
- Allbridge Core SDK package installed ([`@allbridge/bridge-core-sdk`](https://www.npmjs.com/package/@allbridge/bridge-core-sdk))
- TronLink extension installed in the browser. [Docs](https://docs.tronlink.org/)

## Installation
First, install the necessary packages:

```bash
npm install @allbridge/bridge-core-sdk
```

## Step-by-Step Integration

### Step 1: Import Necessary Modules
Import the required modules:

```typescript
import {
  AllbridgeCoreSdk,
  ChainSymbol,
  NodeRpcUrls,
  SendParams,
} from '@allbridge/bridge-core-sdk';
```
### Step 2: Define Node URLs, SDK and tronWeb wallet
Set up the node URLs for the different chains. Initialize the Allbridge Core SDK and the tronWeb instance:

```typescript
const SDK_NODE_URLS: NodeRpcUrls = {
  [ChainSymbol.TRX]: 'https://api.trongrid.io',
};
const sdk = new AllbridgeCoreSdk(SDK_NODE_URLS);
const tronWeb = window.tronLink.tronWeb;
```

### Step 3: Create, sign and send Allbridge raw transaction:

```typescript
const rawTransaction = await sdk.bridge.rawTxBuilder.send(params, tronWeb);
const signedTx = await tronWeb.trx.sign(rawTransaction);
const txId = await tronWeb.trx.sendRawTransaction(signedTx);
console.log('txId', txId);
```

## Conclusion
With this guide, you have set up the Allbridge Core SDK and TronLink wallet integration on your web application using TypeScript. You can now securely send transactions and check their status on the Tron blockchain. For further customization and advanced usage, refer to the official documentation of the respective SDKs.
