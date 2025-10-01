import { PublicKey } from "@solana/web3.js";
import { Address } from "@stellar/stellar-sdk";
import algosdk, { Address as AlgoAddress } from "algosdk";
import { Big, BigSource } from "big.js";
import randomBytes from "randombytes";
import { utils as TronWebUtils } from "tronweb";
import { Chains } from "../../chains";
import { Messenger } from "../../client/core-api/core-api.model";
import { AllbridgeCoreClient } from "../../client/core-api/core-client-base";
import {
  AmountNotEnoughError,
  CCTPDoesNotSupportedError,
  ExtraGasMaxLimitExceededError,
  InvalidGasFeePaymentOptionError,
  OFTDoesNotSupportedError,
  SdkError,
} from "../../exceptions";
import {
  AmountFormat,
  ChainType,
  ExtraGasMaxLimitResponse,
  ExtraGasMaxLimits,
  FeePaymentMethod,
  GasFeeOptions,
  SwapParams,
} from "../../models";
import { ChainDetailsMap, TokenWithChainDetails } from "../../tokens-info";
import { convertAmountPrecision, convertFloatAmountToInt, convertIntAmountToFloat } from "../../utils/calculation";
import {
  SendParams,
  TxSendParams,
  TxSendParamsAlg,
  TxSendParamsEvm,
  TxSendParamsSol,
  TxSendParamsSrb,
  TxSendParamsSui,
  TxSendParamsTrx,
  TxSwapParams,
  TxSwapParamsEvm,
  TxSwapParamsSol,
  TxSwapParamsSrb,
  TxSwapParamsSui,
  TxSwapParamsTrx,
} from "./models"; // 1. OVERLOADS

// 1. OVERLOADS
export function formatAddress(address: string, from: ChainType, to: ChainType.EVM | ChainType.SUI): string;
export function formatAddress(address: string, from: ChainType, to: ChainType.TRX): Buffer;
export function formatAddress(address: string, from: ChainType, to: ChainType.SOLANA | ChainType.SRB): number[];
export function formatAddress(address: string, from: ChainType, to: ChainType): string | number[] | Buffer;

// 2. COMMON Realization
export function formatAddress(address: string, from: ChainType, to: ChainType): string | number[] | Buffer {
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
    case ChainType.SRB: {
      buffer = new Address(address).toBuffer();
      break;
    }
    case ChainType.SUI: {
      buffer = evmAddressToBuffer32(address);
      break;
    }
    case ChainType.ALG: {
      buffer = algAddressToBuffer32(address);
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
      return buffer;
    }
    case ChainType.SRB: {
      return buffer.toJSON().data;
    }
    case ChainType.SUI: {
      return "0x" + buffer.toString("hex");
    }
    case ChainType.ALG: {
      return buffer;
    }
  }
}

export function normalizeSuiHex(hex: string): string {
  return hex.replace(/^0x/i, "");
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex.replace(/^0x/i, ""), "hex");
}

export function evmAddressToBuffer32(address: string): Buffer {
  const length = 32;
  const buff = hexToBuffer(address);
  return Buffer.concat([Buffer.alloc(length - buff.length, 0), buff], length);
}

export function algAddressToBuffer32(address: string): Buffer {
  if (algosdk.isValidAddress(address)) {
    return Buffer.from(AlgoAddress.fromString(address).publicKey);
  }

  if (/^\d+$/.test(address)) {
    let hex = BigInt(address).toString(16);
    hex = hex.padStart(64, "0");
    return Buffer.from(hex, "hex");
  }
  throw new SdkError(`Unexpected Alg address: ${address}`);
}

export function tronAddressToBuffer32(address: string): Buffer {
  const ethAddress = tronAddressToEthAddress(address);
  const buffer = hexToBuffer(ethAddress);
  return bufferToSize(buffer, 32);
}

export function tronAddressToEthAddress(address: string): string {
  const bytes = TronWebUtils.crypto.decodeBase58Address(address);
  if (!bytes) return "";
  return TronWebUtils.bytes.byteArray2hexStr(bytes).replace(/^41/, "0x");
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
  chainSymbol: string,
  tokenAddress: string
): TokenWithChainDetails {
  const chainDetail = chainDetailsMap[chainSymbol];
  if (!chainDetail) {
    throw new SdkError("Cannot find chain detail for " + chainSymbol);
  }
  const token = chainDetail.tokens.find((value) => value.tokenAddress.toUpperCase() === tokenAddress.toUpperCase());
  if (!token) {
    throw new SdkError("Cannot find token info about token " + tokenAddress + " on chain " + chainSymbol);
  }
  return token;
}

export function getNonce(): Buffer {
  return randomBytes(32);
}

export function getNonceBigInt(): bigint {
  const bigint = randomBytes(32).readBigInt64BE();
  if (bigint < 0) {
    return bigint * -1n;
  }
  return bigint;
}

// 1. OVERLOADS
export function prepareTxSwapParams(
  bridgeChainType: ChainType.EVM | ChainType.SUI,
  params: SwapParams
): TxSwapParamsEvm | TxSwapParamsSui;
export function prepareTxSwapParams(bridgeChainType: ChainType.TRX, params: SwapParams): TxSwapParamsTrx;
export function prepareTxSwapParams(
  bridgeChainType: ChainType.SOLANA | ChainType.SRB,
  params: SwapParams
): TxSwapParamsSol | TxSwapParamsSrb;
export function prepareTxSwapParams(bridgeChainType: ChainType, params: SwapParams): TxSwapParams;

// 2. COMMON Realization
export function prepareTxSwapParams(bridgeChainType: ChainType, params: SwapParams): TxSwapParams {
  const txSwapParams = {} as TxSwapParams;
  const sourceToken = params.sourceToken;
  txSwapParams.amount = convertFloatAmountToInt(params.amount, sourceToken.decimals).toFixed();
  txSwapParams.contractAddress = sourceToken.bridgeAddress;
  txSwapParams.fromAccountAddress = params.fromAccountAddress;
  switch (bridgeChainType) {
    case ChainType.SUI: {
      if (!sourceToken.originTokenAddress) {
        throw new SdkError("SUI sourceToken must contain 'originTokenAddress'");
      }
      txSwapParams.fromTokenAddress = sourceToken.originTokenAddress;
      break;
    }
    case ChainType.ALG: {
      txSwapParams.fromTokenAddress = sourceToken.tokenAddress;
      break;
    }
    default: {
      txSwapParams.fromTokenAddress = formatAddress(sourceToken.tokenAddress, bridgeChainType, bridgeChainType);
    }
  }
  txSwapParams.toAccountAddress = params.toAccountAddress;
  switch (bridgeChainType) {
    case ChainType.SUI: {
      if (!params.destinationToken.originTokenAddress) {
        throw new SdkError("SUI destinationToken must contain 'originTokenAddress'");
      }
      txSwapParams.toTokenAddress = params.destinationToken.originTokenAddress;
      break;
    }
    case ChainType.ALG: {
      txSwapParams.toTokenAddress = params.destinationToken.tokenAddress;
      break;
    }
    default: {
      txSwapParams.toTokenAddress = formatAddress(
        params.destinationToken.tokenAddress,
        bridgeChainType,
        bridgeChainType
      );
    }
  }
  txSwapParams.minimumReceiveAmount = params.minimumReceiveAmount
    ? convertFloatAmountToInt(params.minimumReceiveAmount, params.destinationToken.decimals).toFixed()
    : "0";
  return txSwapParams;
}

// 1. OVERLOADS
export function prepareTxSendParams(
  bridgeChainType: ChainType.EVM | ChainType.SUI,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParamsEvm | TxSendParamsSui>;
export function prepareTxSendParams(
  bridgeChainType: ChainType.TRX,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParamsTrx>;
export function prepareTxSendParams(
  bridgeChainType: ChainType.ALG,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParamsAlg>;
export function prepareTxSendParams(
  bridgeChainType: ChainType.SOLANA | ChainType.SRB,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParamsSol | TxSendParamsSrb>;
export function prepareTxSendParams(
  bridgeChainType: ChainType,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParams>;

// 2. COMMON Realization
export async function prepareTxSendParams(
  bridgeChainType: ChainType,
  params: SendParams,
  api: AllbridgeCoreClient
): Promise<TxSendParams> {
  const txSendParams = {} as TxSendParams;

  txSendParams.fromChainId = params.sourceToken.allbridgeChainId;
  txSendParams.fromChainSymbol = params.sourceToken.chainSymbol;
  const toChainType = Chains.getChainProperty(params.destinationToken.chainSymbol).chainType;
  if (bridgeChainType === ChainType.SUI) {
    if (!params.sourceToken.originTokenAddress) {
      throw new SdkError("SUI token must contain 'originTokenAddress'");
    }
    txSendParams.fromTokenAddress = params.sourceToken.originTokenAddress;
  } else {
    txSendParams.fromTokenAddress = params.sourceToken.tokenAddress;
  }

  txSendParams.toChainId = params.destinationToken.allbridgeChainId;
  txSendParams.toTokenAddress = params.destinationToken.tokenAddress;

  if (params.gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
    txSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_STABLECOIN;
  } else {
    // default FeePaymentMethod.WITH_NATIVE_CURRENCY
    txSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_NATIVE_CURRENCY;
  }
  const sourceToken = params.sourceToken;

  switch (params.messenger) {
    case Messenger.CCTP:
      if (!sourceToken.cctpAddress || !params.destinationToken.cctpAddress) {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP protocol");
      }
      txSendParams.contractAddress = sourceToken.cctpAddress;
      break;
    case Messenger.CCTP_V2:
      if (!sourceToken.cctpV2Address || !params.destinationToken.cctpV2Address) {
        throw new CCTPDoesNotSupportedError("Such route does not support CCTP V2 protocol");
      }
      txSendParams.contractAddress = sourceToken.cctpV2Address;

      break;
    case Messenger.OFT:
      if (
        !sourceToken.oftBridgeAddress ||
        !params.destinationToken.oftBridgeAddress ||
        sourceToken.oftId !== params.destinationToken.oftId
      ) {
        throw new OFTDoesNotSupportedError("Such route does not support OFT protocol");
      }
      txSendParams.contractAddress = sourceToken.oftBridgeAddress;
      break;
    case Messenger.ALLBRIDGE:
    case Messenger.WORMHOLE:
      txSendParams.contractAddress = sourceToken.bridgeAddress;
      break;
  }

  txSendParams.messenger = params.messenger;
  txSendParams.fromAccountAddress = params.fromAccountAddress;
  txSendParams.amount = convertFloatAmountToInt(params.amount, sourceToken.decimals).toFixed();

  //Fee
  let { fee, feeFormat } = params;
  if (!fee) {
    const gasFeeOptions = await getGasFeeOptions(
      params.sourceToken,
      txSendParams.toChainId,
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
        txSendParams.fee = convertFloatAmountToInt(fee, Chains.getChainDecimalsByType(sourceToken.chainType)).toFixed(
          0
        );
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
    const extraGasLimits = await getExtraGasMaxLimits(
      sourceToken,
      params.destinationToken,
      txSendParams.messenger,
      api
    );

    let extraGasDecimals: number;
    let extraGasDestRate: Big;
    switch (txSendParams.gasFeePaymentMethod) {
      case FeePaymentMethod.WITH_NATIVE_CURRENCY:
        extraGasDecimals = Chains.getChainDecimalsByType(sourceToken.chainType);
        extraGasDestRate = Big(extraGasLimits.exchangeRate);
        break;
      case FeePaymentMethod.WITH_STABLECOIN:
        extraGasDecimals = sourceToken.decimals;
        extraGasDestRate = Big(extraGasLimits.exchangeRate).div(extraGasLimits.sourceNativeTokenPrice);
        break;
    }

    switch (extraGasFormat ?? AmountFormat.INT) {
      case AmountFormat.FLOAT: {
        txSendParams.extraGas = convertFloatAmountToInt(extraGas, extraGasDecimals).toFixed(0);

        const extraGasDestFloat = extraGasDestRate.mul(extraGas);
        txSendParams.extraGasDest = convertFloatAmountToInt(
          extraGasDestFloat,
          Chains.getChainDecimalsByType(params.destinationToken.chainType)
        ).toFixed(0, Big.roundDown);
        break;
      }
      case AmountFormat.INT: {
        txSendParams.extraGas = extraGas;

        const extraGasFloat = convertIntAmountToFloat(
          txSendParams.extraGas,
          Chains.getChainDecimalsByType(sourceToken.chainType)
        );
        const extraGasDestFloat = extraGasDestRate.mul(extraGasFloat);
        txSendParams.extraGasDest = convertFloatAmountToInt(
          extraGasDestFloat,
          Chains.getChainDecimalsByType(params.destinationToken.chainType)
        ).toFixed(0, Big.roundDown);
        break;
      }
    }

    validateExtraGasNotExceeded(txSendParams.extraGas, txSendParams.gasFeePaymentMethod, extraGasLimits);
  }

  if (![ChainType.SUI, ChainType.ALG].includes(bridgeChainType)) {
    txSendParams.fromTokenAddress = formatAddress(txSendParams.fromTokenAddress, bridgeChainType, bridgeChainType);
  }
  txSendParams.toAccountAddress = formatAddress(params.toAccountAddress, toChainType, bridgeChainType);
  txSendParams.toTokenAddress = formatAddress(txSendParams.toTokenAddress, toChainType, bridgeChainType);
  if (txSendParams.gasFeePaymentMethod == FeePaymentMethod.WITH_STABLECOIN) {
    validateAmountEnough(txSendParams.amount, sourceToken.decimals, txSendParams.fee, txSendParams.extraGas);
  }
  return txSendParams;
}

function validateAmountEnough(
  amountInt: BigSource,
  decimals: number,
  feeInt: BigSource,
  extraGasInt: BigSource | undefined
) {
  const amountTotal = Big(amountInt)
    .minus(feeInt)
    .minus(extraGasInt ?? 0);
  if (amountTotal.lte(0)) {
    throw new AmountNotEnoughError(
      `Amount not enough to pay fee, ${convertIntAmountToFloat(
        Big(amountTotal).minus(1).neg(),
        decimals
      ).toFixed()} stables is missing`
    );
  }
}

export async function getGasFeeOptions(
  sourceChainToken: TokenWithChainDetails,
  destinationAllbridgeChainId: number,
  messenger: Messenger,
  api: AllbridgeCoreClient
): Promise<GasFeeOptions> {
  const transactionCostResponse = await api.getReceiveTransactionCost({
    sourceChainId: sourceChainToken.allbridgeChainId,
    destinationChainId: destinationAllbridgeChainId,
    messenger,
    sourceToken: sourceChainToken.tokenAddress,
  });

  const gasFeeOptions: GasFeeOptions = {
    [FeePaymentMethod.WITH_NATIVE_CURRENCY]: {
      [AmountFormat.INT]: transactionCostResponse.fee,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(
        transactionCostResponse.fee,
        Chains.getChainDecimalsByType(sourceChainToken.chainType)
      ).toFixed(),
    },
    adminFeeShareWithExtras: transactionCostResponse.adminFeeShareWithExtras,
  };
  if (transactionCostResponse.sourceNativeTokenPrice) {
    const gasFeeIntWithStables = convertAmountPrecision(
      new Big(transactionCostResponse.fee).mul(transactionCostResponse.sourceNativeTokenPrice),
      Chains.getChainDecimalsByType(sourceChainToken.chainType),
      sourceChainToken.decimals
    ).toFixed(0, Big.roundUp);
    gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN] = {
      [AmountFormat.INT]: gasFeeIntWithStables,
      [AmountFormat.FLOAT]: convertIntAmountToFloat(gasFeeIntWithStables, sourceChainToken.decimals).toFixed(),
    };
  }

  return gasFeeOptions;
}

function validateExtraGasNotExceeded(
  extraGasInt: string,
  gasFeePaymentMethod: FeePaymentMethod,
  extraGasLimits: ExtraGasMaxLimitResponse
) {
  const extraGasMaxLimit = extraGasLimits.extraGasMax[gasFeePaymentMethod];
  if (!extraGasMaxLimit) {
    throw new InvalidGasFeePaymentOptionError(`Impossible to pay extra gas by '${gasFeePaymentMethod}' payment method`);
  }
  const extraGasMaxIntLimit = extraGasMaxLimit[AmountFormat.INT];
  if (Big(extraGasInt).gt(extraGasMaxIntLimit)) {
    throw new ExtraGasMaxLimitExceededError(
      `Extra gas ${extraGasInt} in int format, exceeded limit ${extraGasMaxIntLimit} for '${gasFeePaymentMethod}' payment method`
    );
  }
}

export async function getExtraGasMaxLimits(
  sourceChainToken: TokenWithChainDetails,
  destinationChainToken: TokenWithChainDetails,
  messenger: Messenger,
  api: AllbridgeCoreClient
): Promise<ExtraGasMaxLimitResponse> {
  const extraGasMaxLimits: ExtraGasMaxLimits = {};
  const transactionCostResponse = await api.getReceiveTransactionCost({
    sourceChainId: sourceChainToken.allbridgeChainId,
    destinationChainId: destinationChainToken.allbridgeChainId,
    messenger,
    sourceToken: sourceChainToken.tokenAddress,
  });
  const maxAmount = destinationChainToken.txCostAmount.maxAmount;
  const maxAmountFloat = convertIntAmountToFloat(
    maxAmount,
    Chains.getChainDecimalsByType(destinationChainToken.chainType)
  ).toFixed();
  const maxAmountFloatInSourceNative = Big(maxAmountFloat)
    .div(transactionCostResponse.exchangeRate)
    .toFixed(Chains.getChainDecimalsByType(sourceChainToken.chainType), Big.roundDown);
  const maxAmountInSourceNative = convertFloatAmountToInt(
    maxAmountFloatInSourceNative,
    Chains.getChainDecimalsByType(sourceChainToken.chainType)
  ).toFixed(0);
  extraGasMaxLimits[FeePaymentMethod.WITH_NATIVE_CURRENCY] = {
    [AmountFormat.INT]: maxAmountInSourceNative,
    [AmountFormat.FLOAT]: maxAmountFloatInSourceNative,
  };
  if (transactionCostResponse.sourceNativeTokenPrice) {
    const maxAmountFloatInStable = Big(maxAmountFloatInSourceNative)
      .mul(transactionCostResponse.sourceNativeTokenPrice)
      .toFixed(sourceChainToken.decimals, Big.roundDown);
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
          Chains.getChainDecimalsByType(destinationChainToken.chainType)
        ).toFixed(),
      },
      transfer: {
        [AmountFormat.INT]: destinationChainToken.txCostAmount.transfer,
        [AmountFormat.FLOAT]: convertIntAmountToFloat(
          destinationChainToken.txCostAmount.transfer,
          Chains.getChainDecimalsByType(destinationChainToken.chainType)
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
