// @ts-nocheck
import { compressSuiType } from "../_framework/util";

class PackageAddress {
  private static $PACKAGE_ID = "";
  private static $PUBLISHED_AT = "";
  private static $PKG_V = [];

  get PACKAGE_ID() {
    return compressSuiType(PackageAddress.$PACKAGE_ID);
  }

  get PUBLISHED_AT() {
    return compressSuiType(PackageAddress.$PUBLISHED_AT);
  }

  get PKG_V1() {
    return compressSuiType(PackageAddress.$PKG_V[1]);
  }

  setPackageId(address: string): void {
    PackageAddress.$PACKAGE_ID = address;
  }

  setPublishedAt(address: string): void {
    PackageAddress.$PUBLISHED_AT = address;
  }

  setPkgV(v: number, address: string): void {
    PackageAddress.$PKG_V[v] = address;
  }

  setAddress(address: string, pkgV1?: string) {
    PackageAddress.$PACKAGE_ID = address;
    PackageAddress.$PUBLISHED_AT = address;
    PackageAddress.$PKG_V[1] = pkgV1 || address;
  }
}

const packageAddress = new PackageAddress();
export = packageAddress;
