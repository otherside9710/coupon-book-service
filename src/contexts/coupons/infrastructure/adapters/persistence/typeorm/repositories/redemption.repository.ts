import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponRedemptionOrmEntity } from '../entities/coupon-redemption.orm-entity';

@Injectable()
export class RedemptionRepository {
  constructor(
    @InjectRepository(CouponRedemptionOrmEntity)
    private readonly repo: Repository<CouponRedemptionOrmEntity>,
  ) {}

  async save(redemption: any): Promise<void> {
    const ent = this.repo.create({
      id: redemption.id,
      couponCodeId: redemption.couponCodeId,
      userId: redemption.userId,
      couponBookId: redemption.couponBookId,
      redemptionDetails: redemption.redemptionDetails || {},
      redeemedAt: redemption.redeemedAt || new Date(),
    } as any);
    await this.repo.save(ent as any);
  }

  async countByUserAndBook(userId: string, bookId: string): Promise<number> {
    return this.repo.count({ where: { userId, couponBookId: bookId } });
  }
}
