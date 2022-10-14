# Allbridge Core SDK: TokensInfo methods

TokensInfo object provides information about supported tokens and chains and can be obtained by invoking [getTokensInfo](https://github.com/allbridge-io/allbridge-core-js-sdk/blob/main/documentation/core-sdk-api.md#get-tokens-info) method on SDK.

## Table of Contents
- [Get Tokens](#get-tokens)
- [Get tokens by chain](#get-tokens-by-chain)
- [Get chain details map](#get-chain-details-map)

## Get tokens

_Method_: tokens

Gets a list of all supported tokens.

_Returns_:

* TokenInfoWithChainDetails[]

TokenInfoWithChainDetails:
```js
{
  // token symbol, e.g. "USDT"
  symbol: string;
  // token name, e.g. "Tether USD"
  name: string;
  // token decimals, e.g. 18
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  poolInfo: PoolInfo;
  feeShare: string;
  apr: number;
  lpRate: number;
  // Chain symbol, e.g. "ETH"
  chainSymbol: string;
  // Chain ID according to EIP-155 as a 0x-prefixed hexadecimal string, e.g. "0x1". Nullable.
  chainId?: string;
  // Chain type, one of the following: "EVM", "SOLANA", "TRX"
  chainType: string;
  // Chain name, e.g. "Ethereum"
  chainName: string;
  // Unique chain identifier
  allbridgeChainId: number;
  // Bridge address on chain
  bridgeAddress: string;
  txTime: TxTime;
  confirmations: number;
}
```

_Example_:

```js
const tokens = tokensInfo.tokens();
```

## Get tokens by chain

_Method_: tokensByChain

Gets a list of all supported tokens on a given chain.

_Params_:

* chainSymbol: ChainSymbol

_Returns_:

* TokenInfoWithChainDetails[] - a list of supported tokens on the given chain

_Example_:

```js
const tokensOnTRX = tokensInfo.tokensByChain(ChainSymbol.TRX);
```

## Get chain details map

_Method_: chainDetailsMap

Gets a map of all supported chains.

_Returns_:

* ChainDetailsMap - an object where key is the Chain Symbol and value is the corresponding chain details

ChainDetailsMap
```js
const chainDetailsMapExample = {
  "BSC": {
    "chainSymbol": "BSC",
      "chainId": "0x38",
      "name": "BNB Chain",
      "chainType": "EVM",
      "allbridgeChainId": 2,
      "bridgeAddress": bridgeAddressOnBSC,
      "txTime": averageTransactionTimeOnBSC,
      "confirmations": 15,
      "tokens": tokensOnBSC
  },
  "ETH": {
    "chainSymbol": "ETH",
      "chainId": "0x1",
      "name": "Ethereum",
      "chainType": "EVM",
      "allbridgeChainId": 1,
      "bridgeAddress": bridgeAddressOnETH,
      "txTime": averageTransactionTimeOnETH,
      "confirmations": 5,
      "tokens": tokensOnETH
  },
  //...
}
```

_Example_:

```js
const chainDetailsMap = tokensInfo.chainDetailsMap();
// get details about chain ETH
const ethChainDetails = chainDetailsMap[ChainSymbol.ETH];
const chainName = ethChainDetails.name;
const bridgeAddress = ethChainDetails.bridgeAddress;
// get tokens on chain ETH
const tokensOnETH = ethChainDetails.tokens;
```
