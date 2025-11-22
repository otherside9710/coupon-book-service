import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'coupon_assignments' })
@Index('idx_coupon_assignments_user_book', ['userId', 'couponBookId'])
export class CouponAssignmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  couponCodeId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  couponBookId: string;

  @Column({ type: 'timestamp' })
  assignedAt: Date;

  @Column({ nullable: true })
  assignmentMethod: string;
}
