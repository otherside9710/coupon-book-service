import { CouponBook } from '@/contexts/coupons/domain/entities/coupon-book.entity';
import { CouponBookOrmEntity } from '../entities/coupon-book.orm-entity';

export class CouponBookMapper {
  static toDomain(orm: CouponBookOrmEntity): CouponBook {
    return new CouponBook({
      id: orm.id,
      name: orm.name,
      totalCodes: orm.totalCodes,
      availableCodes: orm.availableCodes,
      validFrom: orm.validFrom,
      validUntil: orm.validUntil,
      maxCodesPerUser: (orm as any).maxCodesPerUser || (orm as any).max_codes_per_user,
      allowMultipleRedemptionsPerUser: (orm as any).allowMultipleRedemptionsPerUser || (orm as any).allow_multiple_redemptions_per_user,
    });
  }

  static toOrm(domain: CouponBook): Partial<CouponBookOrmEntity> {
    return {
      id: domain.id,
      name: domain.name,
      totalCodes: domain.totalCodes,
      availableCodes: domain.availableCodes,
      maxCodesPerUser: domain.maxCodesPerUser as any,
      allowMultipleRedemptionsPerUser: domain.allowMultipleRedemptionsPerUser as any,
      validFrom: domain.validFrom as any,
      validUntil: domain.validUntil as any,
    };
  }
}
