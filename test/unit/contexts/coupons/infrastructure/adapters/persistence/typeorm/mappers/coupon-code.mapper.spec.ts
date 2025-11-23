import { CouponCodeMapper } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/mappers/coupon-code.mapper';

describe('CouponCodeMapper', () => {
  it('toDomain maps various orm shapes to domain', () => {
    const orm: any = {
      id: 'c1',
      coupon_book_id: 'b1',
      code: 'X',
      status: 'AVAILABLE',
      assigned_to_user_id: 'u1',
      assigned_at: new Date(),
    };

    const domain = CouponCodeMapper.toDomain(orm as any);
    expect(domain.id).toBe('c1');
    expect(domain.couponBookId).toBe('b1');
    expect(domain.assignedToUserId).toBe('u1');
  });

  it('toOrm maps domain to orm partial', () => {
    const domain: any = { id: 'c1', couponBookId: 'b1', code: 'X', status: 'AVAILABLE', assignedToUserId: 'u1', assignedAt: new Date() };
    const orm = CouponCodeMapper.toOrm(domain as any);
    expect(orm.id).toBe('c1');
    expect(orm.couponBookId).toBe('b1');
    expect(orm.assignedToUserId).toBe('u1');
  });
});
