export class InsufficientPoolLiquidity extends Error {
  constructor() {
    super("Insufficient pool liquidity");
    this.name = "InsufficientPoolLiquidity";
  }
}
