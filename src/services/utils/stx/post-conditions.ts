import {
  ContractIdString,
  FungibleComparator,
  FungiblePostCondition,
  parseContractId,
  StxPostCondition,
} from "@stacks/transactions";

export function getFungiblePostCondition(
  amount: string | bigint | number,
  condition: `${FungibleComparator}`,
  accountAddress: string,
  tokenAddress: string,
  tokenName: string
): FungiblePostCondition {
  const [assetAddress, assetContractName] = parseContractId(tokenAddress as ContractIdString);
  if (!assetAddress || !assetContractName) {
    throw new Error(`Unable to parse stx token ${tokenAddress}`);
  }
  return {
    type: "ft-postcondition",
    address: accountAddress,
    condition,
    asset: `${assetAddress}.${assetContractName}::${tokenName}`,
    amount,
  };
}

export function getStxPostCondition(
  amount: string | bigint | number,
  condition: `${FungibleComparator}`,
  accountAddress: string
): StxPostCondition {
  return {
    type: "stx-postcondition",
    address: accountAddress,
    condition,
    amount,
  };
}
