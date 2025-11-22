import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'coupon_books' })
export class CouponBookOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'int', default: 0 })
  totalCodes: number;

  @Column({ type: 'int', default: 0 })
  availableCodes: number;

  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date | null;

  @Column({ type: 'int', nullable: true })
  maxCodesPerUser: number | null;

  @Column({ type: 'boolean', default: false })
  allowMultipleRedemptionsPerUser: boolean;
}
