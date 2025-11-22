import { Injectable, BadRequestException } from '@nestjs/common';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { UploadCodesDto } from '../dto/request/upload-codes.dto';

@Injectable()
export class UploadCodesUseCase {
  constructor(
    private readonly couponCodeRepository: CouponCodeRepository,
    private readonly couponBookRepository: CouponBookRepository,
  ) {}

  async execute(dto: UploadCodesDto & { couponBookId: string }) {
    const { codes, couponBookId } = dto as any;
    const couponBook = await this.couponBookRepository.findById(couponBookId);
    if (!couponBook) throw new Error('CouponBookNotFound');

  const result: any = await this.couponCodeRepository.bulkInsert(codes || [], couponBookId);

    // If there are duplicates, throw a clear BadRequest with details
    if (result.duplicates && result.duplicates.length > 0) {
      throw new BadRequestException(`Los siguientes códigos ya existen: ${result.duplicates.join(', ')}`);
    }

    const inserted = result.inserted || 0;

    if (typeof couponBook.totalCodes === 'number') couponBook.totalCodes += inserted;
    else couponBook.totalCodes = inserted;

    if (typeof couponBook.availableCodes === 'number') couponBook.availableCodes += inserted;
    else couponBook.availableCodes = inserted;

    await this.couponBookRepository.save(couponBook);

    return {
      message: `${inserted} códigos subidos correctamente`,
      couponBookId,
      codesCount: inserted,
      totalAvailable: couponBook.availableCodes || 0,
    };
  }
}