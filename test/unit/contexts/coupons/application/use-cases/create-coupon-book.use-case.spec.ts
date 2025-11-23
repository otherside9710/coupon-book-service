import { CreateCouponBookUseCase } from '@/contexts/coupons/application/use-cases/create-coupon-book.use-case';

describe('CreateCouponBookUseCase', () => {
  let useCase: CreateCouponBookUseCase;
  let couponBookRepository: any;

  beforeEach(() => {
    couponBookRepository = { save: jest.fn() };
    useCase = new CreateCouponBookUseCase(couponBookRepository);
  });

  it('creates a book with given payload and returns it', async () => {
    couponBookRepository.save.mockResolvedValue(undefined);
    const payload = { name: 'test', totalCodes: 5 } as any;
    const res = await useCase.execute(payload);
    expect(res).toHaveProperty('id');
    expect(res.name).toBe('test');
    expect(res.totalCodes).toBe(5);
  });
});
