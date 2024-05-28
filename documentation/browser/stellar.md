
# Integrating Allbridge Core SDK and Browser Extension Wallet with TypeScript

## Introduction
This documentation provides a step-by-step guide on integrating the Allbridge Core SDK and a browser extension wallet (Freighter) using TypeScript in a web project.

## Prerequisites
- TypeScript
- Node.js
- npm or yarn
- Allbridge Core SDK package installed ([`@allbridge/bridge-core-sdk`](https://www.npmjs.com/package/@allbridge/bridge-core-sdk))
- Freighter API package installed (`@stellar/freighter-api`). [Docs](https://docs.freighter.app/docs/guide/introduction)
- Freighter extension installed in the browser

## Installation
First, install the necessary packages:

```bash
npm install @allbridge/bridge-core-sdk @stellar/freighter-api
```

## Step-by-Step Integration

### Step 1: Import Necessary Modules

Import the required modules:

```typescript
import {
 AllbridgeCoreSdk,
 ChainSymbol,
 NodeRpcUrls,
 RawSorobanTransaction,
 RawTransaction,
 SendParams,
 SrbUtils,
} from '@allbridge/bridge-core-sdk';
import freighter, { signTransaction } from '@stellar/freighter-api';
```

### Step 2: Define Node URLs and initialize SDK

Set up the node URLs for the different chains and initialize the Allbridge Core SDK.

```typescript
const SDK_NODE_URLS: NodeRpcUrls = {
 [ChainSymbol.SRB]: 'https://rpc.ankr.com/stellar_soroban',
 [ChainSymbol.STLR]: 'https://horizon.stellar.org',
};
const sdk = new AllbridgeCoreSdk(SDK_NODE_URLS);
```

### Step 3: Create Send Raw Transaction

Implement a function to send raw transactions using the Freighter wallet.

```typescript
async function sendRawTransaction(xdr: string): Promise<string> {
  const { networkPassphrase, networkUrl } = await freighter.getNetworkDetails();
  const signedXdr = await signTransaction(xdr, {
    network: networkUrl,
    networkPassphrase: networkPassphrase,
  });
  const txRes = await sdk.utils.srb.sendTransactionSoroban(signedXdr);
  if (txRes.status !== 'PENDING') {
    throw new Error('Failed transaction');
  }
  return txRes.hash;
}
```

### Step 4: Create, sign and send Allbridge raw transaction:

```typescript
let rawTransaction: RawSorobanTransaction = (await sdk.bridge.rawTxBuilder.send(params)) as RawSorobanTransaction;
const isNeedNewRawTransaction = await checkAndCreateBump(params.fromAccountAddress, rawTransaction);
if (isNeedNewRawTransaction) {
 rawTransaction = (await sdk.bridge.rawTxBuilder.send(params)) as RawSorobanTransaction;
}
const txId = await sendRawTransaction(rawTransaction);
console.log('txId', txId);
```

### Step 5: Check and Create Bump Transaction

Implement a function to check if a bump transaction is needed and create it if necessary.

```typescript
async function checkAndCreateBump(account: string, xdr: RawTransaction): Promise<boolean> {
 const bumpXdr = await sdk.utils.srb.simulateAndCheckRestoreTxRequiredSoroban(xdr as RawSorobanTransaction, account);
 if (bumpXdr) {
   await sendRawTransaction(bumpXdr);
   return true;
 } else {
   return false;
 }
}
```

## Conclusion

With this guide, you have set up the Allbridge Core SDK and Freighter wallet integration on your web application using TypeScript. You can now securely send transactions and check their status on the Soroban blockchain. For further customization and advanced usage, refer to the official documentation of the respective SDKs.
