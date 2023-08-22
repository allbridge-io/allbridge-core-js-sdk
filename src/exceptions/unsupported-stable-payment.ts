export class UnsupportedStablePaymentError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "UnsupportedStablePaymentError";
  }
}
