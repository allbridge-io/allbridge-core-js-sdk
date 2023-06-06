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

```ts
const userBalanceInfo = await sdk.pool.getUserBalanceInfo(
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

```ts
const userBalanceInfo = await sdk.pool.getUserBalanceInfo(
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

```ts
  const aprPercentageStr = sdk.aprInPercents(apr)
```

* apr: number - APR

_Returns_:

* aprPercentageStr: string

### Get Pool info

_Method_: getPoolInfo

Get Pool info by token info

```ts
  const poolInfo = await sdk.getPoolInfo(token, web3);

```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```ts
  const poolInfo = await sdk.getPoolInfo(token);
```

_Params_:

* token: Token
* provider: Provider

_Returns_:

* poolInfo: PoolInfo

### Calculate LP amount will be deposited

_Method_: getLPAmountOnDeposit

Calculates the amount of LP tokens that will be deposited

```ts
const estimatedAmount = await sdk.pool.getAmountToBeDeposited(
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

```ts
const estimatedAmount = await sdk.pool.getAmountToBeDeposited(
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

```ts
const estimatedAmount = await sdk.pool.getAmountToBeWithdrawn(
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

```ts
const estimatedAmount = await sdk.pool.getAmountToBeWithdrawn(
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

SDK method `pool.rawTxBuilder.deposit` can be used to create raw deposit Transaction.

```ts
const rawTransactionDeposit = await sdk.pool.deposit(depositParams, web3);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```ts
const rawTransactionDeposit = await sdk.pool.rawTxBuilder.deposit(depositParams);
```

_Params_:

* depositParams: LiquidityPoolsParamsWithAmount - required data for depositing
* provider: Provider - provider

LiquidityPoolsParamsWithAmount:

```ts
{
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenWithChainDetails |The token object} of operation token.
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

SDK method `pool.rawTxBuilder.withdraw` can be used to create raw withdraw Transaction.

```ts
const rawTransactionDeposit = await sdk.pool.rawTxBuilder.withdraw(withdrawParams, web3);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```ts
const rawTransactionDeposit = await sdk.pool.rawTxBuilder.withdraw(withdrawParams);
```

_Params_:

* withdrawParams: LiquidityPoolsParamsWithAmount - required data for withdrawing
* provider: Provider - provider

LiquidityPoolsParamsWithAmount:

```ts
{
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenWithChainDetails |The token object} of operation token.
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

SDK method `pool.rawTxBuilder.claimRewards` can be used to create raw claim rewards Transaction.

```ts
const rawTransactionDeposit = await sdk.pool.rawTxBuilder.claimRewards(claimRewardsParams, web3);
```

**TIPs:** </br>

- To interact with the **Tron** blockchain: </br>
  use ```tronWeb``` instead of ```web3``` </p>

- To interact with the **Solana** blockchain: </br>
  do not pass provider:

```ts
const rawTransactionDeposit = await sdk.pool.rawTxBuilder.claimRewards(claimRewardsParams);
```

_Params_:

* claimRewardsParams: LiquidityPoolsParams - required data for claiming rewards
* provider: Provider - provider

LiquidityPoolsParams:

```ts
{
  /**
   * The account address to operate tokens with.
   */
  accountAddress: string;
  /**
   * {@link TokenWithChainDetails | The token object} of operation token.
   */
  token: TokenWithChainDetails;
}
```

_Returns_:

* RawTransaction - raw transaction that can be signed and send

