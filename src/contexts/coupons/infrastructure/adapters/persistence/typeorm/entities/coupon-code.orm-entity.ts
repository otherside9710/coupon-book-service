import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'coupon_codes' })
@Index('idx_coupon_codes_code', ['code'], { unique: true })
export class CouponCodeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  couponBookId: string;

  @Column()
  code: string;

  @Column({ default: 'AVAILABLE' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToUserId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  lockedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lockedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lockExpiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  redeemedByUserId: string | null;
}
