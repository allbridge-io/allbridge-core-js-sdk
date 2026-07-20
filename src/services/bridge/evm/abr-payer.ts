import { ChainType } from "../../../chains/chain.enums";
import { Messenger } from "../../../client/core-api/core-api.model";

const ABR_PAYER_TARGET_BY_ROUTE: Record<string, number> = {
  [`${Messenger.CCTP}:${ChainType.SOLANA}`]: 6,
  [`${Messenger.CCTP_V2}:${ChainType.SOLANA}`]: 7,
  [`${Messenger.CCTP_V2}:${ChainType.SRB}`]: 1008,
};

export function getAbrPayerTarget(destinationChainType: ChainType, messenger: Messenger): number {
  return ABR_PAYER_TARGET_BY_ROUTE[`${messenger}:${destinationChainType}`] ?? messenger;
}
