import { BadRequestException } from '@nestjs/common';
import { UploadCodesUseCase } from '@/contexts/coupons/application/use-cases/upload-codes.use-case';

describe('UploadCodesUseCase', () => {
  let useCase: UploadCodesUseCase;
  let couponCodeRepository: any;
  let couponBookRepository: any;

  beforeEach(() => {
    couponCodeRepository = { bulkInsert: jest.fn() };
    couponBookRepository = { findById: jest.fn(), save: jest.fn() };
    useCase = new UploadCodesUseCase(couponCodeRepository, couponBookRepository);
  });

  it('throws when coupon book not found', async () => {
    couponBookRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ couponBookId: 'b1', codes: ['A'] } as any)).rejects.toThrow('CouponBookNotFound');
  });

  it('throws BadRequestException when duplicates present', async () => {
    couponBookRepository.findById.mockResolvedValue({ id: 'b1', totalCodes: 0, availableCodes: 0 } as any);
    couponCodeRepository.bulkInsert.mockResolvedValue({ duplicates: ['A'], inserted: 0 });
    await expect(useCase.execute({ couponBookId: 'b1', codes: ['A'] } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('inserts codes and updates book', async () => {
    const book = { id: 'b1', totalCodes: 1, availableCodes: 1 } as any;
    couponBookRepository.findById.mockResolvedValue(book);
    couponCodeRepository.bulkInsert.mockResolvedValue({ duplicates: [], inserted: 2 });
    couponBookRepository.save.mockResolvedValue(undefined);

    const res = await useCase.execute({ couponBookId: 'b1', codes: ['A', 'B'] } as any);
    expect(res).toHaveProperty('codesCount', 2);
    expect(res.totalAvailable).toBeGreaterThanOrEqual(0);
  });
});
