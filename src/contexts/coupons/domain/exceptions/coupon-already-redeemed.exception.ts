export class CouponAlreadyRedeemedException extends Error {
  constructor(code: string) {
    super(`Coupon already redeemed: ${code}`);
    this.name = 'CouponAlreadyRedeemedException';
  }
}
