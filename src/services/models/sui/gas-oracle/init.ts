// @ts-nocheck
import * as gasOracle from "./gas-oracle/structs";
import { StructClassLoader } from "../_framework/loader";

export function registerClasses(loader: StructClassLoader) {
  loader.register(gasOracle.AdminCap);
  loader.register(gasOracle.ChainData);
  loader.register(gasOracle.GasOracle);
}
