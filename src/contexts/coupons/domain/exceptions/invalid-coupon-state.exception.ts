export class InvalidCouponStateException extends Error {
  constructor(code: string, message?: string) {
    super(message || `Invalid state for coupon: ${code}`);
    this.name = 'InvalidCouponStateException';
  }
}
