import { Injectable } from '@nestjs/common';
import { CouponBookRepository } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { CouponCodeRepository } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookNotFoundException } from '@/contexts/coupons/domain/exceptions/coupon-book-not-found.exception';

@Injectable()
export class DeleteCouponBookUseCase {
  constructor(
    private readonly couponBookRepository: CouponBookRepository,
    private readonly couponCodeRepository: CouponCodeRepository,
  ) {}

  async execute(couponBookId: string): Promise<void> {
    const existing = await this.couponBookRepository.findById(couponBookId);
    if (!existing) throw new CouponBookNotFoundException();

    // Cascade-delete coupon codes associated to this book 
    await this.couponCodeRepository.deleteByBookId(couponBookId);

    await this.couponBookRepository.deleteById(couponBookId);
  }
}
