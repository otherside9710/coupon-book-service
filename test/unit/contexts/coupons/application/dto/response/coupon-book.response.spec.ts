import { CouponBookResponse } from '@/contexts/coupons/application/dto/response/coupon-book.response';

describe('CouponBookResponse DTO', () => {
  it('can be constructed and has fields', () => {
    const response = new CouponBookResponse();
    response.id = 'b1';
    response.name = 'B';
    response.totalCodes = 2;
    response.availableCodes = 1;
    expect(response.id).toBe('b1');
    expect(response.name).toBe('B');
  });
});
