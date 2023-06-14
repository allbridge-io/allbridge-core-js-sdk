import { PublicKey } from "@solana/web3.js";
import { Big } from "big.js";
import randomBytes from "randombytes";
/* @ts-expect-error  Could not find a declaration file for module "tronweb"*/
import * as TronWebLib from "tronweb";
import { chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { Messenger } from "../../client/core-api/core-api.model";
import { FeePaymentMethod, GasFeeOptions } from "../../models";
import { ChainDetailsMap, TokenWithChainDetails } from "../../tokens-info";
import { convertFloatAmountToInt } from "../../utils/calculation";
import { SendParams, TxSendParams } from "./models";

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
    default: {
      throw new Error(
        /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
        `Error in formatAddress method: unknown chain type ${from}, or method not implemented`
      );
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
    default: {
      throw new Error(
        /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */
        `Error in formatAddress method: unknown chain type ${to}, or method not implemented`
      );
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
    throw new Error("Cannot find token info about token " + tokenAddress + " on chain " + chainSymbol);
  }
  return token;
}

export function getNonce(): Buffer {
  return randomBytes(32);
}

export function checkIsGasPaymentMethodSupported(
  gasFeePaymentMethod: FeePaymentMethod | undefined,
  sourceToken: TokenWithChainDetails
) {
  if (gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN && sourceToken.chainSymbol == ChainSymbol.SOL) {
    throw Error(
      `Gas fee payment method '${gasFeePaymentMethod}' is not supported on source chain ${sourceToken.chainSymbol}`
    );
  }
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

  checkIsGasPaymentMethodSupported(params.gasFeePaymentMethod, sourceToken);

  if (params.gasFeePaymentMethod === FeePaymentMethod.WITH_STABLECOIN) {
    txSendParams.contractAddress = sourceToken.bridgeAddress;
    txSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_STABLECOIN;
  } else {
    // default FeePaymentMethod.WITH_NATIVE_CURRENCY
    txSendParams.contractAddress = sourceToken.bridgeAddress;
    txSendParams.gasFeePaymentMethod = FeePaymentMethod.WITH_NATIVE_CURRENCY;
  }

  txSendParams.messenger = params.messenger;
  txSendParams.fromAccountAddress = params.fromAccountAddress;
  txSendParams.amount = convertFloatAmountToInt(params.amount, sourceToken.decimals).toFixed();

  let { fee } = params;
  if (fee == null) {
    const gasFeeOptions = await getGasFeeOptions(
      txSendParams.fromChainId,
      txSendParams.toChainId,
      sourceToken.decimals,
      txSendParams.messenger,
      api
    );

    fee = gasFeeOptions[txSendParams.gasFeePaymentMethod];
    if (!fee) {
      throw Error(`Amount of gas fee cannot be determined for payment method '${txSendParams.gasFeePaymentMethod}'`);
    }
  }
  txSendParams.fee = fee;

  txSendParams.fromTokenAddress = formatAddress(txSendParams.fromTokenAddress, bridgeChainType, bridgeChainType);
  txSendParams.toAccountAddress = formatAddress(params.toAccountAddress, toChainType, bridgeChainType);
  txSendParams.toTokenAddress = formatAddress(txSendParams.toTokenAddress, toChainType, bridgeChainType);
  return txSendParams;
}

export async function getGasFeeOptions(
  sourceAllbridgeChainId: number,
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
    [FeePaymentMethod.WITH_NATIVE_CURRENCY]: transactionCostResponse.fee,
  };
  if (transactionCostResponse.sourceNativeTokenPrice) {
    let stableCoinFee = new Big(transactionCostResponse.fee)
      .mul(transactionCostResponse.sourceNativeTokenPrice)
      .toFixed(0, Big.roundUp);
    stableCoinFee = stableCoinFee === "0" ? "1" : stableCoinFee;
    gasFeeOptions[FeePaymentMethod.WITH_STABLECOIN] = stableCoinFee;
  }

  return gasFeeOptions;
}