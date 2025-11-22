import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { AssignmentRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/assignment.repository';
import { AssignCouponDto } from '../dto/request/assign-coupon.dto';
import { CouponAssignmentResponse } from '../dto/response/coupon-assignment.response';

@Injectable()
export class AssignRandomCouponUseCase {
  constructor(
    private readonly couponCodeRepository: CouponCodeRepository,
    private readonly couponBookRepository: CouponBookRepository,
    private readonly assignmentRepository: AssignmentRepository,
  ) {}

  async execute(dto: AssignCouponDto): Promise<CouponAssignmentResponse> {
    const { couponBookId, userId } = dto;

    const couponBook = await this.couponBookRepository.findById(couponBookId);
    if (!couponBook) {
      throw new NotFoundException(`Coupon book with ID: ${couponBookId} not found`);
    }

    // enforce per-user assignment limit if configured
    if (couponBook.maxCodesPerUser && couponBook.maxCodesPerUser > 0) {
      const assignedCount = await this.assignmentRepository.countByUserAndBook(userId, couponBookId);
      if (assignedCount >= couponBook.maxCodesPerUser) {
        throw new Error('MaxCodesPerUserExceeded');
      }
    }

    // TODO: validate couponBook validity

    const availableCode = await this.couponCodeRepository.findRandomAvailableWithLock(
      couponBookId,
    );

  if (!availableCode) throw new BadRequestException('No available codes in this coupon book');

    // assign
    availableCode.status = 'ASSIGNED';
    availableCode.assignedToUserId = userId;
    availableCode.assignedAt = new Date();

    await this.couponCodeRepository.save(availableCode);

    // record assignment
    const assignment = {
      id: uuidv4(),
      couponCodeId: availableCode.id,
      userId,
      couponBookId,
      assignedAt: new Date(),
      assignmentMethod: 'RANDOM',
    };
    await this.assignmentRepository.save(assignment);

    // decrement stats on couponBook (best-effort)
    if (typeof couponBook.availableCodes === 'number') {
      couponBook.availableCodes = Math.max(0, couponBook.availableCodes - 1);
      await this.couponBookRepository.save(couponBook);
    }

    return CouponAssignmentResponse.fromDomain(availableCode, couponBook, userId);
  }
}
