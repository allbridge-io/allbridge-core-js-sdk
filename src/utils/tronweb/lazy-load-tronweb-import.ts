let TronWeb: any;

export async function getTronWeb() {
  if (!TronWeb) {
    const module = await import("tronweb");
    TronWeb = module.default;
  }
  return TronWeb;
}
