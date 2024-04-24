/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnchorProvider, Provider } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { ChainType } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api";
import { MethodNotSupportedError } from "../../../exceptions";
import { GetNativeTokenBalanceParams } from "../../bridge/models";
import { RawTransaction, TransactionResponse } from "../../models";
import { getTokenAccountData } from "../../utils/sol";
import { getAssociatedAccount } from "../../utils/sol/accounts";
import { ApproveParamsDto, GetAllowanceParamsDto, GetTokenBalanceParams } from "../models";
import { ChainTokenService } from "../models/token";

export class SolanaTokenService extends ChainTokenService {
  chainType: ChainType.SOLANA = ChainType.SOLANA;

  constructor(public solanaRpcUrl: string, public api: AllbridgeCoreClient) {
    super();
  }

  approve(params: ApproveParamsDto): Promise<TransactionResponse> {
    throw new MethodNotSupportedError();
  }

  buildRawTransactionApprove(params: ApproveParamsDto): Promise<RawTransaction> {
    throw new MethodNotSupportedError();
  }

  private buildAnchorProvider(accountAddress: string): Provider {
    const connection = new Connection(this.solanaRpcUrl, "confirmed");

    const publicKey = new PublicKey(accountAddress);

    return new AnchorProvider(
      connection,
      // @ts-expect-error enough wallet for fetch actions
      { publicKey: publicKey },
      {
        preflightCommitment: "processed",
        commitment: "finalized",
      }
    );
  }

  getAllowance(params: GetAllowanceParamsDto): Promise<string> {
    throw new MethodNotSupportedError();
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    const { account, token } = params;
    try {
      const associatedAccount = await getAssociatedAccount(new PublicKey(account), new PublicKey(token.tokenAddress));
      const accountData = await getTokenAccountData(associatedAccount, this.buildAnchorProvider(account));
      return accountData.amount.toString();
    } catch (e) {
      if (e instanceof Error) {
        e.message.startsWith("Account does not exist");
        return "0";
      }
      throw e;
    }
  }

  async getNativeTokenBalance(params: GetNativeTokenBalanceParams): Promise<string> {
    return (
      await this.buildAnchorProvider(params.account).connection.getBalance(new PublicKey(params.account))
    ).toString();
  }
}
