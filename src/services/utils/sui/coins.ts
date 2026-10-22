import { Transaction } from "@mysten/sui/transactions";
import { SuiCoin } from "./client";

export function getCoinsWithAmounts(amounts: string[], coins: SuiCoin[], tx: Transaction) {
  if (coins.length === 0 || !coins[0]) {
    return [];
  }
  const firstCoin = coins[0];
  const requiredAmount = amounts.reduce((total, amount) => total + BigInt(amount), BigInt(0));

  let currentBalance = BigInt(firstCoin.balance);
  const accumulatedCoins: SuiCoin[] = [];

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

function splitAndMergeCoins(tx: Transaction, firstCoin: SuiCoin, accumulatedCoins: SuiCoin[], amounts: string[]) {
  const pureAmounts = amounts.map((amount) => {
    return tx.pure.u64(amount);
  });
  if (accumulatedCoins.length > 0) {
    tx.mergeCoins(
      firstCoin.objectId,
      accumulatedCoins.map((c) => c.objectId)
    );
    return tx.splitCoins(firstCoin.objectId, pureAmounts);
  }

  return tx.splitCoins(firstCoin.objectId, pureAmounts);
}
