import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { AssignmentRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/assignment.repository';
import { AssignCouponDto } from '../dto/request/assign-coupon.dto';
import { CouponAssignmentResponse } from '../dto/response/coupon-assignment.response';

@Injectable()
export class AssignSpecificCouponUseCase {
  constructor(
    private readonly couponCodeRepository: CouponCodeRepository,
    private readonly couponBookRepository: CouponBookRepository,
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  async execute(dto: AssignCouponDto): Promise<CouponAssignmentResponse> {
    const { couponBookId, userId } = dto;
    const couponBook = await this.couponBookRepository.findById(couponBookId);
    if (!couponBook) throw new Error('CouponBookNotFound');

    // enforce per-user assignment limit if configured
    if (couponBook.maxCodesPerUser && couponBook.maxCodesPerUser > 0) {
      const assignedCount = await this.assignmentRepository.countByUserAndBook(userId, couponBookId);
      if (assignedCount >= couponBook.maxCodesPerUser) {
        throw new Error('MaxCodesPerUserExceeded');
      }
    }

    // dto may include a 'code' property for specific assignment
    const anyDto: any = dto as any;
    const code = anyDto.code;
    if (!code) throw new Error('CodeRequired');

    const couponCode = await this.couponCodeRepository.findByCode(code);
    if (!couponCode) throw new Error('CouponCodeNotFound');

    if (couponCode.status !== 'AVAILABLE' && couponCode.status !== 'ASSIGNED') {
      throw new Error('CouponNotAvailable');
    }

    // Mark assigned
    couponCode.status = 'ASSIGNED';
    couponCode.assignedToUserId = userId;
    couponCode.assignedAt = new Date();
    await this.couponCodeRepository.save(couponCode);

    // record assignment
    const assignment = {
      id: uuidv4(),
      couponCodeId: couponCode.id,
      userId,
      couponBookId,
      assignedAt: new Date(),
      assignmentMethod: 'SPECIFIC',
    };
    await this.assignmentRepository.save(assignment);

    if (typeof couponBook.availableCodes === 'number') {
      couponBook.availableCodes = Math.max(0, couponBook.availableCodes - 1);
      await this.couponBookRepository.save(couponBook);
    }

    return CouponAssignmentResponse.fromDomain(couponCode, couponBook, userId);
  }
}
