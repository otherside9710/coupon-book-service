import { CouponCode } from '@/contexts/coupons/domain/entities/coupon-code.entity';
import { CouponCodeOrmEntity } from '../entities/coupon-code.orm-entity';

export class CouponCodeMapper {
  static toDomain(orm: any): CouponCode {
    return new CouponCode({
      id: orm.id,
      couponBookId: orm.coupon_book_id || orm.couponBookId,
      code: orm.code,
      status: orm.status,
      assignedToUserId: orm.assigned_to_user_id || orm.assignedToUserId,
      assignedAt: orm.assigned_at || orm.assignedAt,
      // optional lock/redemption fields (may come from raw queries)
      lockedBy: orm.locked_by || orm.lockedBy || orm.locked_by_user_id || orm.lockedByUserId,
      lockedAt: orm.locked_at || orm.lockedAt,
      lockExpiresAt: orm.lock_expires_at || orm.lockExpiresAt || orm.lock_expires || orm.lockExpires,
      redeemedAt: orm.redeemed_at || orm.redeemedAt,
      redeemedByUserId: orm.redeemed_by_user_id || orm.redeemedByUserId,
    });
  }

  static toOrm(domain: CouponCode): Partial<CouponCodeOrmEntity> {
    return {
      id: domain.id,
      couponBookId: domain.couponBookId,
      code: domain.code,
      status: domain.status,
      assignedToUserId: domain.assignedToUserId as any,
      assignedAt: domain.assignedAt as any,
      lockedBy: (domain as any).lockedBy as any,
      lockedAt: (domain as any).lockedAt as any,
      lockExpiresAt: (domain as any).lockExpiresAt as any,
      redeemedAt: (domain as any).redeemedAt as any,
      redeemedByUserId: (domain as any).redeemedByUserId as any,
    };
  }
}
