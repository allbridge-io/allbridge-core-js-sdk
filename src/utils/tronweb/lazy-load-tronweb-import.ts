let TronWeb: any;

export async function getTronWebModuleDefault() {
  if (!TronWeb) {
    const module = await import("tronweb");
    TronWeb = module.default;
  }
  return TronWeb;
}
