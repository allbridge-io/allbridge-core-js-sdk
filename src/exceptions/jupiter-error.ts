export class JupiterError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "JupiterError";
  }
}
