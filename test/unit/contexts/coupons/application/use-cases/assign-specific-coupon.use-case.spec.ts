import { AssignSpecificCouponUseCase } from '@/contexts/coupons/application/use-cases/assign-specific-coupon.use-case';

describe('AssignSpecificCouponUseCase', () => {
  let useCase: AssignSpecificCouponUseCase;
  let couponCodeRepository: any;
  let couponBookRepository: any;
  let assignmentRepository: any;

  beforeEach(() => {
    couponCodeRepository = {
      findByCode: jest.fn(),
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

    useCase = new AssignSpecificCouponUseCase(
      couponCodeRepository,
      couponBookRepository,
      assignmentRepository,
    );
  });

  it('throws when code not provided', async () => {
    couponBookRepository.findById.mockResolvedValue({ id: 'b1' });
    await expect(useCase.execute({ couponBookId: 'b1', userId: 'u1' } as any)).rejects.toThrow('CodeRequired');
  });

  it('throws when coupon code not found', async () => {
    couponBookRepository.findById.mockResolvedValue({ id: 'b1' });
    couponCodeRepository.findByCode.mockResolvedValue(null);
    await expect(useCase.execute({ couponBookId: 'b1', userId: 'u1', code: 'X' } as any)).rejects.toThrow('CouponCodeNotFound');
  });

  it('assigns specific code successfully', async () => {
    const coupon = { id: 'c1', status: 'AVAILABLE', couponBookId: 'b1', code: 'X' } as any;
    const book = { id: 'b1', availableCodes: 1 } as any;

    couponBookRepository.findById.mockResolvedValue(book);
    couponCodeRepository.findByCode.mockResolvedValue(coupon);
    couponCodeRepository.save.mockResolvedValue(undefined);
    assignmentRepository.save.mockResolvedValue(undefined);
    couponBookRepository.save.mockResolvedValue(undefined);

    const res = await useCase.execute({ couponBookId: 'b1', userId: 'u1', code: 'X' } as any);
    expect(couponCodeRepository.save).toHaveBeenCalled();
    expect(assignmentRepository.save).toHaveBeenCalled();
    expect(res).toHaveProperty('code');
  });
});
