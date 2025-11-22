import { Injectable } from '@nestjs/common';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';

@Injectable()
export class GetAllBooksUseCase {
  constructor(
    private readonly couponBookRepository: CouponBookRepository,
    private readonly couponCodeRepository: CouponCodeRepository,
  ) {}

  async execute() {
    const books = await this.couponBookRepository.findAll();

    const results = await Promise.all(
      books.map(async (b: any) => {
        const codes = await this.couponCodeRepository.findByBook(b.id);
        return {
          id: b.id,
          name: b.name,
          totalCodes: b.totalCodes || 0,
          availableCodes: b.availableCodes || 0,
          maxCodesPerUser: b.maxCodesPerUser || null,
          allowMultipleRedemptionsPerUser: b.allowMultipleRedemptionsPerUser || false,
          validFrom: b.validFrom || null,
          validUntil: b.validUntil || null,
          codes: codes.map((c) => ({
            id: c.id,
            code: c.code,
            status: c.status,
            assignedToUserId: c.assignedToUserId || null,
            assignedAt: c.assignedAt || null,
            lockedBy: c.lockedBy || null,
            lockedAt: c.lockedAt || null,
            redeemedAt: c.redeemedAt || null,
            redeemedByUserId: c.redeemedByUserId || null,
          })),
        };
      }),
    );

    return results;
  }
}
