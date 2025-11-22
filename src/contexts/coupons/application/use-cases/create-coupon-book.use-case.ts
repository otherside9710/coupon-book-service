import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { CreateCouponBookDto } from '../dto/request/create-coupon-book.dto';

@Injectable()
export class CreateCouponBookUseCase {
  constructor(private readonly couponBookRepository: CouponBookRepository) {}

  async execute(payload: CreateCouponBookDto & { id?: string }) {
  const id = (payload as any).id || uuidv4();
    const couponBook = {
      id,
      name: payload.name,
      totalCodes: payload.totalCodes || 0,
      availableCodes: payload.totalCodes || 0,
      maxCodesPerUser: (payload as any).maxCodesPerUser || null,
      allowMultipleRedemptionsPerUser: (payload as any).allowMultipleRedemptionsPerUser || false,
      validFrom: (payload as any).validFrom || null,
      validUntil: (payload as any).validUntil || null,
    } as any;

    await this.couponBookRepository.save(couponBook);
    return couponBook;
  }
}
