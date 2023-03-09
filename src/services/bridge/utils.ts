import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import randomBytes from "randombytes";
/* @ts-expect-error  Could not find a declaration file for module "tronweb"*/
import * as TronWebLib from "tronweb";
import { chainProperties, ChainSymbol, ChainType } from "../../chains";
import { AllbridgeCoreClient } from "../../client/core-api";
import { ChainDetailsMap, TokenInfoWithChainDetails } from "../../tokens-info";
import { convertFloatAmountToInt } from "../../utils/calculation";
import {
  ApproveData,
  ApproveDataWithTokenInfo,
  GetAllowanceParamsWithTokenAddress,
  GetAllowanceParamsWithTokenInfo,
  GetTokenBalanceParamsWithTokenAddress,
  GetTokenBalanceParamsWithTokenInfo,
  SendParamsWithChainSymbols,
  SendParamsWithTokenInfos,
  TxSendParams,
} from "./models";

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

export function getDecimalsByContractAddress(
  chainDetailsMap: ChainDetailsMap,
  chainSymbol: ChainSymbol,
  contractAddress: string
): number {
  return getTokenInfoByTokenAddress(chainDetailsMap, chainSymbol, contractAddress).decimals;
}

export function getTokenInfoByTokenAddress(
  chainDetailsMap: ChainDetailsMap,
  chainSymbol: ChainSymbol,
  tokenAddress: string
): TokenInfoWithChainDetails {
  const tokenInfo = chainDetailsMap[chainSymbol].tokens.find(
    (value) => value.tokenAddress.toUpperCase() === tokenAddress.toUpperCase()
  );
  if (!tokenInfo) {
    throw new Error("Cannot find token info about token " + tokenAddress + " on chain " + chainSymbol);
  }
  return tokenInfo;
}

export function getNonce(): Buffer {
  return randomBytes(32);
}

export async function prepareTxSendParams(
  bridgeChainType: ChainType,
  params: SendParamsWithChainSymbols | SendParamsWithTokenInfos,
  api: AllbridgeCoreClient
): Promise<TxSendParams> {
  const txSendParams = {} as TxSendParams;
  let toChainType;

  if (isSendParamsWithChainSymbol(params)) {
    const chainDetailsMap = await api.getChainDetailsMap();
    txSendParams.fromChainId = chainDetailsMap[params.fromChainSymbol].allbridgeChainId;
    txSendParams.fromChainSymbol = params.fromChainSymbol;
    toChainType = chainProperties[params.toChainSymbol].chainType;
    txSendParams.contractAddress = chainDetailsMap[params.fromChainSymbol].bridgeAddress;
    txSendParams.fromTokenAddress = params.fromTokenAddress;
    txSendParams.toChainId = chainDetailsMap[params.toChainSymbol].allbridgeChainId;
    txSendParams.toTokenAddress = params.toTokenAddress;
    txSendParams.amount = convertFloatAmountToInt(
      params.amount,
      getDecimalsByContractAddress(chainDetailsMap, params.fromChainSymbol, txSendParams.fromTokenAddress)
    ).toFixed();
  } else {
    txSendParams.fromChainId = params.sourceChainToken.allbridgeChainId;
    txSendParams.fromChainSymbol = params.sourceChainToken.chainSymbol as ChainSymbol;
    toChainType = chainProperties[params.destinationChainToken.chainSymbol].chainType;
    txSendParams.contractAddress = params.sourceChainToken.bridgeAddress;
    txSendParams.fromTokenAddress = params.sourceChainToken.tokenAddress;

    txSendParams.toChainId = params.destinationChainToken.allbridgeChainId;
    txSendParams.toTokenAddress = params.destinationChainToken.tokenAddress;
    txSendParams.amount = convertFloatAmountToInt(params.amount, params.sourceChainToken.decimals).toFixed();
  }
  txSendParams.messenger = params.messenger;
  txSendParams.fromAccountAddress = params.fromAccountAddress;

  let { fee } = params;
  if (fee == null) {
    fee = await api.getReceiveTransactionCost({
      sourceChainId: txSendParams.fromChainId,
      destinationChainId: txSendParams.toChainId,
      messenger: txSendParams.messenger,
    });
  }
  txSendParams.fee = fee;

  txSendParams.fromTokenAddress = formatAddress(txSendParams.fromTokenAddress, bridgeChainType, bridgeChainType);
  txSendParams.toAccountAddress = formatAddress(params.toAccountAddress, toChainType, bridgeChainType);
  txSendParams.toTokenAddress = formatAddress(txSendParams.toTokenAddress, toChainType, bridgeChainType);
  return txSendParams;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export function isSendParamsWithChainSymbol(
  params: SendParamsWithChainSymbols | SendParamsWithTokenInfos
): params is SendParamsWithChainSymbols {
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
  return (params as SendParamsWithChainSymbols).fromChainSymbol !== undefined;
}

export function isGetAllowanceParamsWithTokenInfo(
  params: GetAllowanceParamsWithTokenAddress | GetAllowanceParamsWithTokenInfo
): boolean {
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
  return (params as GetAllowanceParamsWithTokenInfo).tokenInfo !== undefined;
}

export function isApproveDataWithTokenInfo(params: ApproveData | ApproveDataWithTokenInfo): boolean {
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
  return (params as ApproveDataWithTokenInfo).token !== undefined;
}

export function isGetTokenBalanceParamsWithTokenInfo(
  params: GetTokenBalanceParamsWithTokenAddress | GetTokenBalanceParamsWithTokenInfo
): params is GetTokenBalanceParamsWithTokenInfo {
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
  return (params as GetTokenBalanceParamsWithTokenInfo).tokenInfo !== undefined;
}

export function amountToHex(amount: string): string {
  return "0x" + new BN(amount).toString("hex");
}
