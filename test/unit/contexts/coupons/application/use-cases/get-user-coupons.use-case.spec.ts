import { GetUserCouponsUseCase } from '@/contexts/coupons/application/use-cases/get-user-coupons.use-case';

describe('GetUserCouponsUseCase', () => {
  let useCase: GetUserCouponsUseCase;
  let couponCodeRepository: any;

  beforeEach(() => {
    couponCodeRepository = { findByUser: jest.fn() };
    useCase = new GetUserCouponsUseCase(couponCodeRepository);
  });

  it('returns user coupons response with mapped data', async () => {
    const codes = [{ id: 'c1', code: 'X', status: 'ASSIGNED', assignedAt: new Date(), couponBookId: 'b1', assignedToUserId: 'u1' } as any];
    couponCodeRepository.findByUser.mockResolvedValue(codes);

    const resp = await useCase.execute('u1');
    expect(resp).toHaveProperty('data');
    expect(resp.userId).toBe('u1');
    expect(resp.data[0].code).toBe('X');
  });
});
