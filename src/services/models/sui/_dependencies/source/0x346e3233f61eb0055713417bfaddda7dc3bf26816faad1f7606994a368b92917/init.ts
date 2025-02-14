// @ts-nocheck
import * as mintAllowance from "./mint-allowance/structs";
import * as treasury from "./treasury/structs";
import { StructClassLoader } from "../../../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(mintAllowance.MintAllowance);
  loader.register(treasury.Burn);
  loader.register(treasury.MintCap);
  loader.register(treasury.Treasury);
  loader.register(treasury.TreasuryCapKey);
}
