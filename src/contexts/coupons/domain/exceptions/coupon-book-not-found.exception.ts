export class CouponBookNotFoundException extends Error {
  constructor(message?: string) {
    super(message ?? 'Coupon book not found');
    this.name = 'CouponBookNotFoundException';
  }
}
