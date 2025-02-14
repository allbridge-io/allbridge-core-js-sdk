import { CoinStruct } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export function getCoinsWithAmounts(amounts: string[], coins: CoinStruct[], tx: Transaction) {
  if (coins.length === 0 || !coins[0]) {
    return [];
  }
  const firstCoin = coins[0];
  const requiredAmount = amounts.reduce((total, amount) => total + BigInt(amount), BigInt(0));

  let currentBalance = BigInt(firstCoin.balance);
  const accumulatedCoins: CoinStruct[] = [];

  for (const coin of coins.slice(1)) {
    if (currentBalance > requiredAmount) {
      return splitAndMergeCoins(tx, firstCoin, accumulatedCoins, amounts);
    } else {
      currentBalance += BigInt(coin.balance);
      accumulatedCoins.push(coin);
    }
  }

  if (currentBalance >= requiredAmount) {
    return splitAndMergeCoins(tx, firstCoin, accumulatedCoins, amounts);
  } else {
    return [];
  }
}

function splitAndMergeCoins(tx: Transaction, firstCoin: CoinStruct, accumulatedCoins: CoinStruct[], amounts: string[]) {
  const pureAmounts = amounts.map((amount) => {
    return tx.pure.u64(amount);
  });
  if (accumulatedCoins.length > 0) {
    tx.mergeCoins(
      firstCoin.coinObjectId,
      accumulatedCoins.map((c) => c.coinObjectId)
    );
    return tx.splitCoins(firstCoin.coinObjectId, pureAmounts);
  }

  return tx.splitCoins(firstCoin.coinObjectId, pureAmounts);
}
