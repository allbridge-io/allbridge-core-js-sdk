import { NATIVE_MINT } from "@solana/spl-token";
import { VersionedTransaction } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { Big } from "big.js";
import { Chains } from "../../../chains";
import { AllbridgeCoreClient } from "../../../client/core-api/core-client-base";
import { AmountNotEnoughError, JupiterError, SdkError, SdkRootError } from "../../../exceptions";
import { ChainType, FeePaymentMethod, TokenWithChainDetails } from "../../../models";
import { convertIntAmountToFloat } from "../../../utils/calculation";
import { SolanaTxFeeParams } from "../../models";
import { normalizeSolanaTxFeeParams } from "../../utils/sol/compute-budget";
import { SendParams } from "../models";
import { SolTxSendParams } from "./utils";

export interface JupiterParams {
  jupiterUrl: string;
  jupiterApiKeyHeader?: string;
  jupiterMaxAccounts?: number;
}

const JUP_ADD_INDEX = 1.1;

export class JupiterService {
  jupiterUrl: string;
  apiKeyHeader?: string;
  maxAccounts?: number;

  constructor(
    private api: AllbridgeCoreClient,
    jupiterParams: JupiterParams
  ) {
    this.jupiterUrl = jupiterParams.jupiterUrl.replace(/\/$/, ""); // trim last "/" if exist
    this.apiKeyHeader = jupiterParams.jupiterApiKeyHeader;
    this.maxAccounts = jupiterParams.jupiterMaxAccounts;
  }

  async buildJupAndUpdateTxSendParams(
    params: SendParams,
    solTxSendParams: SolTxSendParams
  ): Promise<{ jupTx: VersionedTransaction; solTxSendParams: SolTxSendParams }> {
    const txFeeParams = normalizeSolanaTxFeeParams(params.txFeeParams?.solana);

    try {
      const { tx, solTxSendUpdatedParams } = await this.processJup(solTxSendParams, params, txFeeParams, true);
      return { jupTx: tx, solTxSendParams: { ...solTxSendParams, ...solTxSendUpdatedParams } };
    } catch (ignoreError) {
      try {
        const { tx, solTxSendUpdatedParams } = await this.processJup(solTxSendParams, params, txFeeParams, false);
        return { jupTx: tx, solTxSendParams: { ...solTxSendParams, ...solTxSendUpdatedParams } };
      } catch (e) {
        if (e instanceof SdkRootError) {
          throw e;
        }
        if (e instanceof Error && e.message) {
          throw new JupiterError(`Some error occurred during creation Jupiter swap transaction. ${e.message}`);
        }
        throw new JupiterError("Some error occurred during creation Jupiter swap transaction");
      }
    }
  }

  private async processJup(
    solTxSendParams: SolTxSendParams,
    params: SendParams,
    txFeeParams: SolanaTxFeeParams,
    exactOut: boolean
  ): Promise<{
    tx: VersionedTransaction;
    solTxSendUpdatedParams: {
      amount: string;
      fee: string;
      extraGas?: string;
      gasFeePaymentMethod: FeePaymentMethod;
    };
  }> {
    const { fee, extraGas, gasFeePaymentMethod, sourceNativeTokenPrice } =
      await this.convertStableCoinFeeAndExtraGasToNativeCurrency(params.sourceToken, solTxSendParams);

    let amountToProcess = exactOut ? Big(fee) : Big(solTxSendParams.fee);
    if (extraGas) {
      amountToProcess = amountToProcess.plus(extraGas);
    }

    if (txFeeParams?.payTxFeeWithStablecoinSwap) {
      const feeTx = 5000;
      const txAccountCreation = 2296800 + 1224960;
      const totalFee = feeTx + txAccountCreation;

      if (exactOut) {
        amountToProcess = amountToProcess.plus(totalFee);
      } else {
        if (!sourceNativeTokenPrice) {
          throw new SdkError("sourceNativeTokenPrice is undefined.");
        }
        const totalFeeInStable = Big(totalFee)
          .mul(sourceNativeTokenPrice)
          .div(Big(10).pow(Chains.getChainDecimalsByType(ChainType.SOLANA) - params.sourceToken.decimals))
          .toFixed(0);
        amountToProcess = amountToProcess.plus(totalFeeInStable);
      }
    }

    if (!exactOut) {
      amountToProcess = amountToProcess.mul(JUP_ADD_INDEX);
    }

    const { tx, amountIn } = await this.getJupiterSwapTx(
      params.fromAccountAddress,
      params.sourceToken.tokenAddress,
      amountToProcess.toFixed(0),
      exactOut
    );

    let newAmount: string;
    if (exactOut) {
      if (!amountIn) {
        throw new JupiterError("Cannot get inAmount");
      }
      newAmount = Big(solTxSendParams.amount).minus(Big(amountIn).mul(JUP_ADD_INDEX)).toFixed(0);
    } else {
      newAmount = Big(solTxSendParams.amount).minus(amountToProcess).toFixed(0);
    }
    if (Big(newAmount).lte(0)) {
      throw new AmountNotEnoughError(
        `Amount not enough to pay fee, ${convertIntAmountToFloat(
          Big(newAmount).minus(1).neg(),
          params.sourceToken.decimals
        ).toFixed()} stables is missing`
      );
    }
    return {
      tx: tx,
      solTxSendUpdatedParams: {
        amount: newAmount,
        fee: fee,
        extraGas: extraGas,
        gasFeePaymentMethod: gasFeePaymentMethod,
      },
    };
  }

  private async convertStableCoinFeeAndExtraGasToNativeCurrency(
    sourceToken: TokenWithChainDetails,
    solTxSendParams: SolTxSendParams
  ): Promise<{
    fee: string;
    extraGas?: string;
    gasFeePaymentMethod: FeePaymentMethod;
    sourceNativeTokenPrice?: string;
  }> {
    if (solTxSendParams.gasFeePaymentMethod == FeePaymentMethod.WITH_STABLECOIN) {
      const sourceNativeTokenPrice = (
        await this.api.getReceiveTransactionCost({
          sourceChainId: solTxSendParams.fromChainId,
          destinationChainId: solTxSendParams.toChainId,
          messenger: solTxSendParams.messenger,
          sourceToken: sourceToken.tokenAddress,
        })
      ).sourceNativeTokenPrice;
      const fee = Big(solTxSendParams.fee)
        .div(sourceNativeTokenPrice)
        .mul(Big(10).pow(Chains.getChainDecimalsByType(ChainType.SOLANA) - sourceToken.decimals))
        .toFixed(0);
      let extraGas;
      if (solTxSendParams.extraGas) {
        extraGas = Big(solTxSendParams.extraGas)
          .div(sourceNativeTokenPrice)
          .mul(Big(10).pow(Chains.getChainDecimalsByType(ChainType.SOLANA) - sourceToken.decimals))
          .toFixed(0);
      }
      return { fee, extraGas, gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY, sourceNativeTokenPrice };
    }
    return {
      fee: solTxSendParams.fee,
      extraGas: solTxSendParams.extraGas,
      gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
    };
  }

  private async getJupiterSwapTx(
    userAddress: string,
    stableTokenAddress: string,
    amount: string,
    exactOut: boolean
  ): Promise<{ tx: VersionedTransaction; amountIn?: string }> {
    let quoteResponse: any;
    try {
      const swapMode = exactOut ? "ExactOut" : "ExactIn";
      let url = `${this.jupiterUrl}/quote?inputMint=${stableTokenAddress}&outputMint=${NATIVE_MINT.toString()}&amount=${amount}&swapMode=${swapMode}&slippageBps=100&onlyDirectRoutes=true`;

      if (this.maxAccounts) {
        url += `&maxAccounts=${this.maxAccounts}`;
      }
      quoteResponse = await axios.get(url, {
        headers: this.apiKeyHeader ? { "x-api-key": this.apiKeyHeader } : undefined,
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
        throw new JupiterError(err.response.data.error);
      }
      throw new JupiterError("Cannot get route");
    }

    let inAmount;
    if (exactOut && quoteResponse?.data?.inAmount) {
      inAmount = quoteResponse.data.inAmount;
    } else if (exactOut) {
      throw new JupiterError("Cannot get inAmount");
    }

    let transactionResponse: any;
    try {
      transactionResponse = await axios.post(
        `${this.jupiterUrl}/swap`,
        {
          quoteResponse: quoteResponse.data,
          userPublicKey: userAddress,
          wrapAndUnwrapSol: true,
        },
        {
          headers: this.apiKeyHeader ? { "x-api-key": this.apiKeyHeader } : undefined,
        }
      );
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.data && err.response.data.error) {
        throw new JupiterError(err.response.data.error);
      }
      throw new JupiterError("Cannot get swap transaction");
    }

    let swapTransaction;
    if (transactionResponse?.data?.swapTransaction) {
      swapTransaction = transactionResponse.data.swapTransaction;
    } else {
      throw new JupiterError("Cannot get swap transaction");
    }

    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const tx = VersionedTransaction.deserialize(swapTransactionBuf);

    return exactOut ? { tx, amountIn: inAmount } : { tx };
  }
}
