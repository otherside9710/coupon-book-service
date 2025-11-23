import { CouponCode } from '@/contexts/coupons/domain/entities/coupon-code.entity';

describe('CouponCode entity', () => {
  it('assignTo sets status and assigned fields', () => {
    const couponInstance = new CouponCode({ id: 'c1', status: 'AVAILABLE' } as any);
    couponInstance.assignTo('user1');
    expect(couponInstance.status).toBe('ASSIGNED');
    expect(couponInstance.assignedToUserId).toBe('user1');
    expect(couponInstance.assignedAt).toBeInstanceOf(Date);
  });

  it('isAssignedTo returns true only for matching user', () => {
    const couponAssigned = new CouponCode({ assignedToUserId: 'user1' } as any);
    expect(couponAssigned.isAssignedTo('user1')).toBe(true);
    expect(couponAssigned.isAssignedTo('other')).toBe(false);
  });
});
