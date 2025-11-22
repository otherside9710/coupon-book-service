import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponAssignmentOrmEntity } from '../entities/coupon-assignment.orm-entity';

@Injectable()
export class AssignmentRepository {
  constructor(
    @InjectRepository(CouponAssignmentOrmEntity)
    private readonly repo: Repository<CouponAssignmentOrmEntity>,
  ) {}

  async save(assignment: any): Promise<void> {
    const ent = this.repo.create({
      id: assignment.id,
      couponCodeId: assignment.couponCodeId,
      userId: assignment.userId,
      couponBookId: assignment.couponBookId,
      assignedAt: assignment.assignedAt || new Date(),
      assignmentMethod: assignment.assignmentMethod || 'RANDOM',
    } as any);
    await this.repo.save(ent as any);
  }

  async countByUserAndBook(userId: string, bookId: string): Promise<number> {
    return this.repo.count({ where: { userId, couponBookId: bookId } });
  }
}
