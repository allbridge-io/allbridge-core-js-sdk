/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* @ts-expect-error  Could not find a declaration file for module "tronweb"*/
import * as TronWebLib from "tronweb";
import { ChainType } from "../chains";

export function formatAddress(
  address: string,
  from: ChainType,
  to: ChainType
): string {
  let buffer: Buffer;
  switch (from) {
    case ChainType.EVM: {
      buffer = evmAddressToBuffer32(address);
      break;
    }
    case ChainType.SOLANA: {
      throw new Error(
        `Error in formatAddress method: method not implemented for SOLANA`
      );
    }
    case ChainType.TRX: {
      buffer = tronAddressToBuffer32(address);
      break;
    }
    default: {
      throw new Error(
        `Error in formatAddress method: unknown chain type ${from}, or method not implemented`
      );
    }
  }

  switch (to) {
    case ChainType.EVM: {
      return "0x" + buffer.toString("hex");
    }
    case ChainType.SOLANA: {
      throw new Error(
        `Error in formatAddress method: method not implemented for toChainType: SOLANA`
      );
    }
    case ChainType.TRX: {
      return buffer.toString();
    }
    default: {
      throw new Error(
        `Error in formatAddress method: unknown chain type ${to}, or method not implemented`
      );
    }
  }
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex.replace(/^0x/i, ""), "hex");
}

export function evmAddressToBuffer32(address: string): Buffer {
  const length = 32;
  const buff = hexToBuffer(address);
  return Buffer.concat([Buffer.alloc(length - buff.length, 0), buff], length);
}

export function tronAddressToBuffer32(address: string): Buffer {
  const ethAddress = tronAddressToEthAddress(address);
  const buffer = hexToBuffer(ethAddress);
  return bufferToSize(buffer, 32);
}

export function tronAddressToEthAddress(address: string): string {
  return Buffer.from(TronWebLib.utils.crypto.decodeBase58Address(address))
    .toString("hex")
    .replace(/^41/, "0x");
}

export function bufferToSize(buffer: Buffer, size: number): Buffer {
  if (buffer.length >= size) {
    return buffer;
  }
  const result = Buffer.alloc(size, 0);
  buffer.copy(result, size - buffer.length);
  return result;
}
