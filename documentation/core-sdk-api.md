# Allbridge Core SDK: SDK API

## Table of Contents
- [Approve Tokens](#approve-tokens)
- [Send Tokens](#send-tokens)
- [Get Tokens](#get-tokens)
- [Get tokens by chain](#get-tokens-by-chain)
- [Get chain details map](#get-chain-details-map)
- [Calculate fee percent on source chain](#calculate-fee-percent-on-source-chain)
- [Calculate fee percent on destination chain](#calculate-fee-percent-on-destination-chain)
- [Get amount to be received](#get-amount-to-be-received)
- [Get amount to send](#get-amount-to-send)
- [Get tx cost](#get-tx-cost)
- [Get amount to be received and tx cost](#get-amount-to-be-received-and-tx-cost)
- [Get amount to send and tx cost](#get-amount-to-send-and-tx-cost)
- [Get average transfer time](#get-average-transfer-time)
- [Refresh pool information](#refresh-pool-information)

## Approve Tokens
_Method_: approve

Approve tokens usage by bridge on EVM and TRX blockchains for completing transfer</p>
For Ethereum USDT - due to specificity of the USDT contract:<br/>
If the current allowance is not 0, this function will perform an additional transaction to set allowance to 0 before setting the new allowance value.

_Params_:

* provider: Provider - provider
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

_Returns_:

* TransactionResponse - response with completed transaction id

TransactionResponse:

```js
{
  txId: string;
}
```

_Example_:

```js
const approveData = {
  tokenAddress: tokenAddress,
  owner: accountAddress,
  spender: contractAddress,
};
const response = await sdk.approve(web3, approveData);
```

## Send Tokens
_Method_: send

Sends tokens through the bridge

_Params_:

* provider: Provider - provider
* sendParams: SendParamsWithChainSymbols | SendParamsWithTokenInfos

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

_Returns_:

* TransactionResponse - response with completed transaction id

TransactionResponse:

```js
{
  txId: string;
}
```

_Example_:

```js
const response = await sdk.send(web3, sendParams);
```

## Get tokens

_Method_: tokens

Gets a list of all supported tokens.

_Returns_:

* TokenInfoWithChainDetails[] - a list of all supported tokens.

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
  transferTime: TransferTime;
  confirmations: number;
}
```

_Example_:

```js
const tokens = await sdk.tokens();
```

## Get tokens by chain

_Method_: tokensByChain

Gets a list of all supported tokens on a given chain.

_Params_:

* chainSymbol: ChainSymbol

_Returns_:

* TokenInfoWithChainDetails[] - a list of supported tokens on a given chain

_Example_:

```js
const tokensOnTRX = await sdk.tokensByChain(ChainSymbol.TRX);
```

## Get chain details map

_Method_: chainDetailsMap

Gets information about supported tokens and chains as a map.

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
    "transferTime": averageTransactionTime,
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
    "transferTime": averageTransactionTime,
    "confirmations": 5,
    "tokens": tokensOnETH
  },
  //...
}
```

_Example_:

```js
const chainDetailsMap = await sdk.chainDetailsMap();
// get details about chain ETH
const ethChainDetails = chainDetailsMap[ChainSymbol.ETH];
const chainName = ethChainDetails.name;
const bridgeAddress = ethChainDetails.bridgeAddress;
// get tokens on chain ETH
const tokensOnETH = ethChainDetails.tokens;
```

## Calculate fee percent on source chain

_Method_: calculateFeePercentOnSourceChain

Calculates the percentage of fee from the initial amount that is charged when transferring from the given source chain.

_Params_:

* amountFloat: string | number | Big - initial amount of tokens to swap
* sourceChainToken: TokenInfo - the source chain token info, see [Get Tokens Info](#get-tokens-info)

_Returns_:

* number - The percentage of fee

_Example_:

```js
 const sourceFeePercent = await sdk.calculateFeePercentOnSourceChain(
  amount,
  sourceToken
);
```

## Calculate fee percent on destination chain

_Method_: calculateFeePercentOnDestinationChain

Calculates the percentage of fee that is charged when transferring to the given destination chain. The destination chain fee percent applies to the amount after the source chain fee.

_Params_:

* amountFloat: string | number | Big - initial amount of tokens to swap
* sourceChainToken: TokenInfo - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfo - the destination chain token info

_Returns_:

* number - The percentage of fee

_Example_:

```js
const destinationFeePercent = await sdk.calculateFeePercentOnDestinationChain(
  amount,
  sourceToken,
  destinationToken
);
```

## Get amount to be received
_Method_: getAmountToBeReceived

Calculates the amount of tokens the receiving party will get as a result of the swap.

_Params_:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that will be sent
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)

_Returns_:

* string - The amount to send

_Example_:

```js
const amountToBeReceived = await sdk.getAmountToBeReceived(
  amount,
  sourceToken,
  destinationToken
);
```

## Get amount to send
_Method_: getAmountToSend

Calculates the amount of tokens to send based on the required amount of tokens the receiving party should get as a
result of the swap.

_Params_:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that should be received
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)

_Returns_:

* string - The amount to send

_Example_:

```js
const amountToSend = await sdk.getAmountToSend(
  amount,
  sourceToken,
  destinationToken
);
```

## Get tx cost
_Method_: getTxCost

Fetches the amount of units in source chain currency to pay for the transfer.

_Params_:

* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

_Returns_:

* string - The amount of gas fee to pay for transfer in the smallest denomination of the source chain currency.

_Example_:

```js
const txCost = await sdk.getTxCost(
  sourceTokenInfoWithChainDetails,
  destinationTokenInfoWithChainDetails,
  Messenger.ALLBRIDGE
);
```

## Get amount to be received and tx cost
_Method_: getAmountToBeReceivedAndTxCost

See [Get amount to be received](#get-amount-to-be-received), [Get tx cost](#get-tx-cost)

_Params_:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that will be sent
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

_Returns_:

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

_Example_:

```js
const {amountToSendFloat, amountToBeReceivedFloat, txCost} =
  await sdk.getAmountToBeReceivedAndTxCost(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
```

## Get amount to send and tx cost
_Method_: getAmountToSendAndTxCost

See [Get amount to send](#get-amount-to-send), [Get tx cost](#get-tx-cost)

_Params_:

* amountToBeReceivedFloat: string | number | Big - the amount of tokens that should be received
* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

_Returns_:

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

_Example_:

```js
const {amountToSendFloat, amountToBeReceivedFloat, txCost} =
  await sdk.getAmountToSendAndTxCost(
    amount,
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE
  );
```

## Get average transfer time
_Method_: getAverageTransferTime

Gets the average time in ms to complete a transfer for given tokens and messenger.

_Params_:

* sourceChainToken: TokenInfoWithChainDetails - the source chain token info, see [Get Tokens Info](#get-tokens-info)
* destinationChainToken: TokenInfoWithChainDetails - the destination chain token info,
  see [Get Tokens Info](#get-tokens-info)
* messenger: Messenger

_Returns_:

* null | number - Average transfer time in milliseconds or null if given combination of tokens and messenger is not
  supported.

_Example_:

```js
const transferTimeMs = sdk.getAverageTransferTime(
  sourceToken,
  destinationToken,
  Messenger.ALLBRIDGE
);
```

## Refresh pool information
_Method_: refreshPoolInfo

Forces refresh of cached information about the state of liquidity pools. Outdated cache leads to calculated amounts to be less accurate. The cache is invalidated at regular intervals, but it can be forced to be refreshed by calling this method.

_Example_:

```js
// update the state of liquidity pools
await sdk.refreshPoolInfo();
// calculate amount to be received using updated information
const amountToBeReceived = await sdk.getAmountToBeReceived(
  amount,
  sourceToken,
  destinationToken
);
```
