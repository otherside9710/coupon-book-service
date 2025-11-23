import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AssignRandomCouponUseCase } from '@/contexts/coupons/application/use-cases/assign-random-coupon.use-case';

describe('AssignRandomCouponUseCase', () => {
  let useCase: AssignRandomCouponUseCase;
  let couponCodeRepository: any;
  let couponBookRepository: any;
  let assignmentRepository: any;

  beforeEach(() => {
    couponCodeRepository = {
      findRandomAvailableWithLock: jest.fn(),
      save: jest.fn(),
    };
    couponBookRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    assignmentRepository = {
      save: jest.fn(),
      countByUserAndBook: jest.fn(),
    };

    useCase = new AssignRandomCouponUseCase(
      couponCodeRepository,
      couponBookRepository,
      assignmentRepository,
    );
  });

  it('throws NotFoundException when coupon book not found', async () => {
    couponBookRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ couponBookId: 'b1', userId: 'u1' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when no available codes', async () => {
    couponBookRepository.findById.mockResolvedValue({ id: 'b1' });
    couponCodeRepository.findRandomAvailableWithLock.mockResolvedValue(null);

    await expect(useCase.execute({ couponBookId: 'b1', userId: 'u1' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assigns a code successfully', async () => {
    const code = { id: 'c1', status: 'AVAILABLE', couponBookId: 'b1', code: 'ABC' } as any;
    const book = { id: 'b1', availableCodes: 2 } as any;

    couponBookRepository.findById.mockResolvedValue(book);
    couponCodeRepository.findRandomAvailableWithLock.mockResolvedValue(code);
    couponCodeRepository.save.mockResolvedValue(undefined);
    assignmentRepository.save.mockResolvedValue(undefined);
    couponBookRepository.save.mockResolvedValue(undefined);

    const res = await useCase.execute({ couponBookId: 'b1', userId: 'u1' } as any);

    expect(couponCodeRepository.save).toHaveBeenCalled();
    expect(assignmentRepository.save).toHaveBeenCalled();
    expect(couponBookRepository.save).toHaveBeenCalled();
    expect(res).toHaveProperty('code');
  });
});
