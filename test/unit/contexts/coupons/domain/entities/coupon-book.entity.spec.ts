import { CouponBook } from '@/contexts/coupons/domain/entities/coupon-book.entity';

describe('CouponBook entity', () => {
  it('isValid respects validFrom and validUntil', () => {
    const currentDate = new Date();
    const pastDate = new Date(currentDate.getTime() - 1000);
    const futureDate = new Date(currentDate.getTime() + 1000);

    const couponBookValid = new CouponBook({ validFrom: pastDate, validUntil: futureDate });
    expect(couponBookValid.isValid()).toBe(true);

    const couponBookStartsInFuture = new CouponBook({ validFrom: futureDate });
    expect(couponBookStartsInFuture.isValid()).toBe(false);

    const couponBookExpired = new CouponBook({ validUntil: pastDate });
    expect(couponBookExpired.isValid()).toBe(false);
  });

  it('hasMaxCodesPerUser returns correctly', () => {
    expect(new CouponBook({ maxCodesPerUser: 0 }).hasMaxCodesPerUser()).toBe(false);
    expect(new CouponBook({ maxCodesPerUser: 2 }).hasMaxCodesPerUser()).toBe(true);
  });

  it('allowsMultipleRedemptions returns correctly', () => {
    expect(new CouponBook({ allowMultipleRedemptionsPerUser: false }).allowsMultipleRedemptions()).toBe(false);
    expect(new CouponBook({ allowMultipleRedemptionsPerUser: true }).allowsMultipleRedemptions()).toBe(true);
  });

  it('decrementAvailableCodes lowers counter but not below zero', () => {
    const couponBook = new CouponBook({ availableCodes: 1 });
    couponBook.decrementAvailableCodes();
    expect(couponBook.availableCodes).toBe(0);
    couponBook.decrementAvailableCodes();
    expect(couponBook.availableCodes).toBe(0);
  });
});
