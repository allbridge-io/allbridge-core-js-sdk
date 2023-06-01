# Allbridge Core SDK: SDK API

## Liquidity Pools operations

## Table of Contents

- [Get User Balance info](#Get-User-Balance-info)
- [Convert APR to percentage](#Convert-APR-to-percentage)
- [Get Pool info](#get-pool-info)
- [Calculate LP amount will be deposited](#calculate-LP-amount-will-be-deposited)
- [Calculate amount will be received on withdraw](#calculate-amount-will-be-received-on-withdraw)
- [Transaction builder:](#transaction-builder)
  - [Deposit](#deposit-tokens)
  - [Withdraw](#withdraw-tokens)
  - [Claim rewards](#claim-rewards)

### Get User Balance info

_Method_: getLiquidityBalanceInfo

Get User Balance info

```js
const userBalanceInfo = await sdk.getLiquidityBalanceInfo(
        accountAddress,
        token,
        web3
);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
const userBalanceInfo = await sdk.getLiquidityBalanceInfo(
        accountAddress,
        token
);
```

_Params_:

* accountAddress:
* token: Token
* provider: Provider

_Returns_:

* userBalanceInfo:UserBalanceInfo

### Convert APR to percentage

_Method_: aprInPercents

Convert apr:number to apr string percentage view

```js
  const aprPercentageStr = sdk.aprInPercents(apr)
```

* apr: number - APR

_Returns_:

* aprPercentageStr: string

### Get Pool info

_Method_: getPool

Get Pool info by token info

```js
  const poolInfo = await sdk.getPool(token, web3);

```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
  const poolInfo = await sdk.getPool(token);
```

_Params_:

* token: Token
* provider: Provider

_Returns_:

* poolInfo: Pool

### Calculate LP amount will be deposited

_Method_: getLPAmountOnDeposit

Calculates the amount of LP tokens that will be deposited

```js
const estimatedAmount = await sdk.getLPAmountOnDeposit(
        amount,
        token,
        web3
);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
const estimatedAmount = await sdk.getLPAmountOnDeposit(
        amount,
        token
);
```

_Params_:

* amount: - The float amount of tokens that will be sent
* token: Token
* provider: Provider

_Returns_:

* amount

### Calculate amount will be received on withdraw

_Method_: getAmountToBeWithdrawn

Calculates the amount of tokens will be withdrawn

```js
const estimatedAmount = await sdk.getAmountToBeWithdrawn(
        amount,
        accountAddress,
        token,
        web3
);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
const estimatedAmount = await sdk.getAmountToBeWithdrawn(
        amount,
        accountAddress,
        token
);
```

_Params_:

* amount: - The float amount of tokens that will be requested
* accountAddress: - Account address
* token: Token
* provider: Provider

_Returns_:

* amount

### Transaction builder

### Deposit Tokens

_Method_: deposit

Deposit tokens to liquidity pool

SDK method `rawTransactionBuilder.deposit` can be used to create raw deposit Transaction.

```js
const rawTransactionDeposit = await sdk.rawTransactionBuilder.deposit(depositParams, web3);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
const rawTransactionDeposit = await sdk.rawTransactionBuilder.deposit(depositParams);
```

_Params_:

* depositParams: LiquidityPoolsParamsWithAmount - required data for depositing
* provider: Provider - provider

LiquidityPoolsParamsWithAmount:

```js
{
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenInfoWithChainDetails |The token info object} of operation token.
   */
  token: TokenWithChainDetails;
  /**
   * The float amount of tokens.
   */
  amount: string;
}
```

_Returns_:

* RawTransaction - raw transaction that can be signed and send

### Withdraw Tokens

_Method_: withdraw

Withdraw tokens from liquidity pool

SDK method `rawTransactionBuilder.withdraw` can be used to create raw withdraw Transaction.

```js
const rawTransactionDeposit = await sdk.rawTransactionBuilder.withdraw(withdrawParams, web3);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
const rawTransactionDeposit = await sdk.rawTransactionBuilder.withdraw(withdrawParams);
```

_Params_:

* withdrawParams: LiquidityPoolsParamsWithAmount - required data for withdrawing
* provider: Provider - provider

LiquidityPoolsParamsWithAmount:

```js
{
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenInfoWithChainDetails |The token info object} of operation token.
   */
  token: TokenWithChainDetails;
  /**
   * The float amount of tokens.
   */
  amount: string;
}
```

_Returns_:

* RawTransaction - raw transaction that can be signed and send

### Claim Rewards

_Method_: claimReward

Claim tokens rewards from liquidity pool

SDK method `rawTransactionBuilder.claimRewards` can be used to create raw claim rewards Transaction.

```js
const rawTransactionDeposit = await sdk.rawTransactionBuilder.claimRewards(claimRewardsParams, web3);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```js
const rawTransactionDeposit = await sdk.rawTransactionBuilder.claimRewards(claimRewardsParams);
```

_Params_:

* claimRewardsParams: LiquidityPoolsParams - required data for claiming rewards
* provider: Provider - provider

LiquidityPoolsParams:

```js
{
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenInfoWithChainDetails |The token info object} of operation token.
   */
  token: TokenWithChainDetails;
}
```

_Returns_:

* RawTransaction - raw transaction that can be signed and send

