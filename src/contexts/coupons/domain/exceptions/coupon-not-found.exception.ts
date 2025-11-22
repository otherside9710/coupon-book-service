export class CouponNotFoundException extends Error {
  constructor(idOrCode: string) {
    super(`Coupon not found: ${idOrCode}`);
    this.name = 'CouponNotFoundException';
  }
}
