import { CouponBookNotFoundException } from '@/contexts/coupons/domain/exceptions/coupon-book-not-found.exception';
import { CouponNotFoundException } from '@/contexts/coupons/domain/exceptions/coupon-not-found.exception';
import { CouponAlreadyRedeemedException } from '@/contexts/coupons/domain/exceptions/coupon-already-redeemed.exception';
import { InvalidCouponStateException } from '@/contexts/coupons/domain/exceptions/invalid-coupon-state.exception';
import { MaxRedemptionsReachedException } from '@/contexts/coupons/domain/exceptions/max-redemptions-reached.exception';

describe('Domain exceptions', () => {
  it('CouponBookNotFoundException has default message and name', () => {
    const exceptionDefault = new CouponBookNotFoundException();
    expect(exceptionDefault).toBeInstanceOf(Error);
    expect(exceptionDefault.name).toBe('CouponBookNotFoundException');
    expect(exceptionDefault.message).toBe('Coupon book not found');
  });

  it('CouponBookNotFoundException accepts custom message', () => {
    const exceptionCustom = new CouponBookNotFoundException('custom');
    expect(exceptionCustom.message).toBe('custom');
  });

  it('CouponNotFoundException composes message with id', () => {
    const notFoundException = new CouponNotFoundException('XYZ');
    expect(notFoundException.name).toBe('CouponNotFoundException');
    expect(notFoundException.message).toContain('XYZ');
  });

  it('CouponAlreadyRedeemedException composes message with code', () => {
    const alreadyRedeemedException = new CouponAlreadyRedeemedException('C1');
    expect(alreadyRedeemedException.name).toBe('CouponAlreadyRedeemedException');
    expect(alreadyRedeemedException.message).toContain('C1');
  });

  it('InvalidCouponStateException default message includes code and allows custom message', () => {
    const invalidStateDefault = new InvalidCouponStateException('C2');
    expect(invalidStateDefault.message).toContain('C2');

    const invalidStateCustom = new InvalidCouponStateException('C2', 'my msg');
    expect(invalidStateCustom.message).toBe('my msg');
  });

  it('MaxRedemptionsReachedException composes informative message', () => {
    const maxRedemptionsException = new MaxRedemptionsReachedException('user1', 'book1');
    expect(maxRedemptionsException.name).toBe('MaxRedemptionsReachedException');
    expect(maxRedemptionsException.message).toContain('user1');
    expect(maxRedemptionsException.message).toContain('book1');
  });
});
