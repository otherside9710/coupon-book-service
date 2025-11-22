import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'coupon_redemptions' })
@Index('idx_coupon_redemptions_user_book', ['userId', 'couponBookId'])
export class CouponRedemptionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  couponCodeId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  couponBookId: string;

  @Column({ type: 'json', nullable: true })
  redemptionDetails: any;

  @Column({ type: 'timestamp' })
  redeemedAt: Date;
}
