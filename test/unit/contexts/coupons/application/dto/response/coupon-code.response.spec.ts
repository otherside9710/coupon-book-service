import { CouponCodeResponse } from '@/contexts/coupons/application/dto/response/coupon-code.response';

describe('CouponCodeResponse DTO', () => {
  it('can be constructed and has fields', () => {
    const response = new CouponCodeResponse();
    response.id = 'c1';
    response.code = 'X';
    response.status = 'AVAILABLE';
    response.assignedAt = new Date();
    expect(response.id).toBe('c1');
    expect(response.code).toBe('X');
    expect(response.status).toBe('AVAILABLE');
  });
});
