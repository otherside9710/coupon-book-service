import { CouponBookMapper } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/mappers/coupon-book.mapper';

describe('CouponBookMapper', () => {
  it('toDomain maps snake_case orm to domain', () => {
    const orm: any = {
      id: 'b1',
      name: 'B',
      totalCodes: 5,
      availableCodes: 3,
      maxCodesPerUser: 2,
      allowMultipleRedemptionsPerUser: true,
      validFrom: null,
      validUntil: null,
    };

    const domain = CouponBookMapper.toDomain(orm as any);
    expect(domain.id).toBe('b1');
    expect(domain.totalCodes).toBe(5);
    expect(domain.availableCodes).toBe(3);
    expect(domain.maxCodesPerUser).toBe(2);
    expect(domain.allowMultipleRedemptionsPerUser).toBe(true);
  });

  it('toOrm maps domain to orm shape', () => {
    const domain: any = { id: 'b1', name: 'B', totalCodes: 2, availableCodes: 1, maxCodesPerUser: 1, allowMultipleRedemptionsPerUser: false };
    const orm = CouponBookMapper.toOrm(domain as any);
    expect(orm.id).toBe('b1');
    expect(orm.totalCodes).toBe(2);
    expect(orm.availableCodes).toBe(1);
  });
});
