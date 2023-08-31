import { PublicKey } from "@solana/web3.js";
import { Big } from "big.js";
import randomBytes from "randombytes";
/* @ts-expect-error  Could not find a declaration file for module "tronweb"*/
import * as TronWebLib from "tronweb";
import { ChainDecimalsByType, chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { Messenger } from "../../client/core-api/core-api.model";
import { ExtraGasMaxLimitExceededError, InvalidGasFeePaymentOptionError, SdkError } from "../../exceptions";
import {
  AmountFormat,
  ExtraGasMaxLimitResponse,
  ExtraGasMaxLimits,
  FeePaymentMethod,
  GasFeeOptions,
  SwapParams,
} from "../../models";
import { ChainDetailsMap, TokenWithChainDetails } from "../../tokens-info";
import { convertAmountPrecision, convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import { SendParams, TxSendParams, TxSwapParams } from "./models";

export function formatAddress(address: string, from: ChainType, to: ChainType): string | number[] {
  let buffer: Buffer;
  switch (from) {
    case ChainType.EVM: {
      buffer = evmAddressToBuffer32(address);
      break;
    }
    case ChainType.SOLANA: {
      buffer = new PublicKey(address).toBuffer();
      break;
    }
    case ChainType.TRX: {
      buffer = tronAddressToBuffer32(address);
      break;
    }
  }

  switch (to) {
    case ChainType.EVM: {
      return "0x" + buffer.toString("hex");
    }
    case ChainType.SOLANA: {
      return Array.from(buffer);
    }
    case ChainType.TRX: {
      return buffer.toJSON().data;
    }
  }
}

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex.replace(/^0x/i, ""), "hex");
}

function evmAddressToBuffer32(address: string): Buffer {
  const length = 32;
  const buff = hexToBuffer(address);
  return Buffer.concat([Buffer.alloc(length - buff.length, 0), buff], length);
}

function tronAddressToBuffer32(address: string): Buffer {
  const ethAddress = tronAddressToEthAddress(address);
  const buffer = hexToBuffer(ethAddress);
  return bufferToSize(buffer, 32);
}

export function tronAddressToEthAddress(address: string): string {
  return Buffer.from(TronWebLib.utils.crypto.decodeBase58Address(address)).toString("hex").replace(/^41/, "0x");
}

function bufferToSize(buffer: Buffer, size: number): Buffer {
  if (buffer.length >= size) {
    return buffer;
  }
  const result = Buffer.alloc(size, 0);
  buffer.copy(result, size - buffer.length);
  return result;
}

export function getTokenByTokenAddress(
  chainDetailsMap: ChainDetailsMap,
  chainSymbol: ChainSymbol,
  tokenAddress: string
): TokenWithChainDetails {
  const token = chainDetailsMap[chainSymbol].tokens.find(
    (value) => value.tokenAddress.toUpperCase() === tokenAddress.toUpperCase()
  );
  if (!token) {
    throw new SdkError("Cannot find token info about token " + tokenAddress + " on chain " + chainSymbol);
  }
  return token;
}

export function getNonce(): Buffer {
  return randomBytes(32);
}

export function isStablePaymentMethodSupported(sourceChainType: ChainType, messenger: Messenger): boolean {
  if (sourceChainType == ChainType.SOLANA && messenger == Messenger.WORMHOLE) {
    return false;
  }
  return true;
}

export function prepareTxSwapParams(bridgeChainType: ChainType, params: SwapParams): TxSwapParams {
  const txSwapParams = {} as TxSwapParams;
  const sourceToken = params.sourceToken;
  txSwapParams.amount = convertFloatAmountToInt(params.amount, sourceToken.decimals).toFixed();
  txSwapParams.contractAddress = sourceToken.bridgeAddress;
  txSwapParams.fromAccountAddress = params.fromAccountAddress;
  txSwapParams.fromTokenAddress = formatAddress(sourceToken.tokenAddress, bridgeChainType, bridgeChainType);
  txSwapParams.toAccountAddress = params.toAccountAddress;
  txSwapParams.toTokenAddress = formatAddress(params.destinationToken.tokenAddress, bridgeChainType, bridgeChainType);
  txSwapParams.minimumReceiveAmount = params.minimumReceiveAmount
    ? convertFloatAmountToInt(params.minimumReceiveAmount, params.destinationToken.decimals).toFixed()
    : "0";
  return txSwapParams;
}

export async function prepareTxSendParams(
  bridgeChainType: ChainType,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParams> {
  const txSendParams = {} as TxSendParams;

  txSendParams.fromChainId = params.sourceToken.allbridgeChainId;
  txSendParams.fromChainSymbol = params.sourceToken.chainSymbol;
  const toChainType = chainProperties[params.destinationToken.chainSymbol].chainType;
  txSendParams.contractAddress = params.sourceToken.bridgeAddress;
  txSendParams.fromTokenAddress = params.sourceToken.tokenAddress;

  txSendParams.toChainId = params.destinationToken.allbridgeChainId;
  txSendParams.toTokenAddress = params.destinationToken.tokenAddress;
  const sourceToken = params.sourceToken;
  txSendParams.contractAddress = sourceToken.bridgeAddress;

  if (params.gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
    if (!isStablePaymentMethodSupported(params.sourceToken.chainType, params.messenger)) {
      throw new InvalidGasFeePaymentOptionError(
        `For '${params.sourceToken.chainType}' chain send tx unavailable for payment method '${
          params.gasFeePaymentMethod
        }' via '${Messenger[params.messenger]}' messenger`
      );
    }
    txSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_STABLECOIN;
  } else {
    // default FeePaymentMethod.WITH_NATIVE_CURRENCY
    txSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_NATIVE_CURRENCY;
  }

  txSendParams.messenger = params.messenger;
  txSendParams.fromAccountAddress = params.fromAccountAddress;
  txSendParams.amount = convertFloatAmountToInt(params.amount, sourceToken.decimals).toFixed();

  //Fee
  let { fee, feeFormat } = params;
  if (!fee) {
    const gasFeeOptions = await getGasFeeOptions(
      txSendParams.fromChainId,
      params.sourceToken.chainType,
      txSendParams.toChainId,
      sourceToken.decimals,
      txSendParams.messenger,
      api
    );

    const gasFeeOption = gasFeeOptions[txSendParams.gasFeePaymentMethod];
    if (!gasFeeOption) {
      throw new InvalidGasFeePaymentOptionError();
    }
    fee = gasFeeOption[AmountFormat.INT];
    feeFormat = AmountFormat.INT;
  }
  if (feeFormat == AmountFormat.FLOAT) {
    switch (txSendParams.gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY:
        txSendParams.fee = convertFloatAmountToInt(fee, ChainDecimalsByType[sourceToken.chainType]).toFixed(0);
        break;
      case FeePaymentMethod.WITH_STABLECOIN:
        txSendParams.fee = convertFloatAmountToInt(fee, sourceToken.decimals).toFixed(0);
        break;
    }
  } else {
    txSendParams.fee = fee;
  }

  //ExtraGas
  const { extraGas, extraGasFormat } = params;
  if (extraGas && +extraGas > 0) {
    if (extraGasFormat == AmountFormat.FLOAT) {
      switch (txSendParams.gasFeePaymentMethod) {
        case FeePaymentMethod.WITH_NATIVE_CURRENCY:
          txSendParams.extraGas = convertFloatAmountToInt(extraGas, ChainDecimalsByType[sourceToken.chainType]).toFixed(
            0
          );
          break;
        case FeePaymentMethod.WITH_STABLECOIN:
          txSendParams.extraGas = convertFloatAmountToInt(extraGas, sourceToken.decimals).toFixed(0);
          break;
      }
    } else {
      txSendParams.extraGas = extraGas;
    }
    await validateExtraGasNotExceeded(
      txSendParams.extraGas,
      txSendParams.gasFeePaymentMethod,
      sourceToken,
      params.destinationToken,
      api
    );
  }

  txSendParams.fromTokenAddress = formatAddress(txSendParams.fromTokenAddress, bridgeChainType, bridgeChainType);
  txSendParams.toAccountAddress = formatAddress(params.toAccountAddress, toChainType, bridgeChainType);
  txSendParams.toTokenAddress = formatAddress(txSendParams.toTokenAddress, toChainType, bridgeChainType);
  return txSendParams;
}

export async function getGasFeeOptions(
  sourceAllbridgeChainId: number,
  sourceChainType: ChainType,
  destinationAllbridgeChainId: number,
  sourceChainTokenDecimals: number,
  messenger: Messenger,
  api: AllbridgeCoreClient
): Promise<GasFeeOptions> {
  const transactionCostResponse = await api.getReceiveTransactionCost({
    sourceChainId: sourceAllbridgeChainId,
    destinationChainId: destinationAllbridgeChainId,
    messenger,
  });

  const gasFeeOptions: GasFeeOptions = {
    [FeePaymentMethod.WITH_NATIVE_CURRENCY]: {
      [AmountFormat.INT]: transactionCostResponse.fee,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(
        transactionCostResponse.fee,
        ChainDecimalsByType[sourceChainType]
      ).toFixed(),
    },
  };
  if (transactionCostResponse.sourceNativeTokenPrice && isStablePaymentMethodSupported(sourceChainType, messenger)) {
    const gasFeeIntWithStables = convertAmountPrecision(
      new Big(transactionCostResponse.fee).mul(transactionCostResponse.sourceNativeTokenPrice),
      ChainDecimalsByType[sourceChainType],
      sourceChainTokenDecimals
    ).toFixed(0, Big.roundUp);
    gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN] = {
      [AmountFormat.INT]: gasFeeIntWithStables,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(gasFeeIntWithStables, sourceChainTokenDecimals).toFixed(),
    };
  }

  return gasFeeOptions;
}

async function validateExtraGasNotExceeded(
  extraGasInInt: string,
  gasFeePaymentMethod: FeePaymentMethod,
  sourceToken: TokenWithChainDetails,
  destinationToken: TokenWithChainDetails,
  api: AllbridgeCoreClient
) {
  const extraGasLimits = await getExtraGasMaxLimits(sourceToken, destinationToken, api);
  const extraGasMaxLimit = extraGasLimits.extraGasMax[gasFeePaymentMethod];
  if (!extraGasMaxLimit) {
    throw new InvalidGasFeePaymentOptionError(`Impossible to pay extra gas by '${gasFeePaymentMethod}' payment method`);
  }
  const extraGasMaxIntLimit = extraGasMaxLimit[AmountFormat.INT];
  if (Big(extraGasInInt).gt(extraGasMaxIntLimit)) {
    throw new ExtraGasMaxLimitExceededError(
      `Extra gas ${extraGasInInt} in int format, exceeded limit ${extraGasMaxIntLimit} for '${gasFeePaymentMethod}' payment method`
    );
  }
}

export async function getExtraGasMaxLimits(
  sourceChainToken: TokenWithChainDetails,
  destinationChainToken: TokenWithChainDetails,
  api: AllbridgeCoreClient
): Promise<ExtraGasMaxLimitResponse> {
  const extraGasMaxLimits: ExtraGasMaxLimits = {};
  const transactionCostResponse = await api.getReceiveTransactionCost({
    sourceChainId: sourceChainToken.allbridgeChainId,
    destinationChainId: destinationChainToken.allbridgeChainId,
    messenger: Messenger.ALLBRIDGE,
  });
  const maxAmount = destinationChainToken.txCostAmount.maxAmount;
  const maxAmountFloat = convertIntAmountToFloat(
    maxAmount,
    ChainDecimalsByType[destinationChainToken.chainType]
  ).toFixed();
  const maxAmountFloatInSourceNative = Big(maxAmountFloat).div(transactionCostResponse.exchangeRate).toFixed();
  const maxAmountInSourceNative = convertFloatAmountToInt(
    maxAmountFloatInSourceNative,
    ChainDecimalsByType[sourceChainToken.chainType]
  ).toFixed(0);
  extraGasMaxLimits[FeePaymentMethod.WITH_NATIVE_CURRENCY] = {
    [AmountFormat.INT]: maxAmountInSourceNative,
    [AmountFormat.FLOAT]: maxAmountFloatInSourceNative,
  };
  if (transactionCostResponse.sourceNativeTokenPrice) {
    const maxAmountFloatInStable = Big(maxAmountFloatInSourceNative)
      .mul(transactionCostResponse.sourceNativeTokenPrice)
      .toFixed();
    extraGasMaxLimits[FeePaymentMethod.WITH_STABLECOIN] = {
      [AmountFormat.INT]: convertFloatAmountToInt(maxAmountFloatInStable, sourceChainToken.decimals).toFixed(0),
      [AmountFormat.FLOAT]: maxAmountFloatInStable,
    };
  }
  return {
    extraGasMax: extraGasMaxLimits,
    destinationChain: {
      gasAmountMax: {
        [AmountFormat.INT]: maxAmount,
        [AmountFormat.FLOAT]: maxAmountFloat,
      },
      swap: {
        [AmountFormat.INT]: destinationChainToken.txCostAmount.swap,
        [AmountFormat.FLOAT]: convertIntAmountToFloat(
          destinationChainToken.txCostAmount.swap,
          ChainDecimalsByType[destinationChainToken.chainType]
        ).toFixed(),
      },
      transfer: {
        [AmountFormat.INT]: destinationChainToken.txCostAmount.transfer,
        [AmountFormat.FLOAT]: convertIntAmountToFloat(
          destinationChainToken.txCostAmount.transfer,
          ChainDecimalsByType[destinationChainToken.chainType]
        ).toFixed(),
      },
    },
    exchangeRate: transactionCostResponse.exchangeRate,
    sourceNativeTokenPrice: transactionCostResponse.sourceNativeTokenPrice,
  };
}

export function isSendParams(params: SwapParams | SendParams): params is SendParams {
  return params.sourceToken.chainSymbol !== params.destinationToken.chainSymbol;
}
