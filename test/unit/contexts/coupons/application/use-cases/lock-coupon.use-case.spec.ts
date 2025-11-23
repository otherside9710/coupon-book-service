import { LockCouponUseCase } from '@/contexts/coupons/application/use-cases/lock-coupon.use-case';
import { HttpException } from '@nestjs/common';

describe('LockCouponUseCase', () => {
  let useCase: LockCouponUseCase;
  let couponCodeRepository: any;
  let couponBookRepository: any;
  let lockService: any;

  beforeEach(() => {
    couponCodeRepository = { findByCode: jest.fn(), save: jest.fn() };
    couponBookRepository = { findById: jest.fn() };
    lockService = { acquireLock: jest.fn(), getLockInfo: jest.fn() };

    useCase = new LockCouponUseCase(couponCodeRepository, couponBookRepository, lockService as any);
  });

  it('throws when coupon not found', async () => {
    couponCodeRepository.findByCode.mockResolvedValue(null);
    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toThrow('CouponCodeNotFound');
  });

  it('throws 423 when lock cannot be acquired and existing lock present', async () => {
    const coupon = { id: 'c1', status: 'ASSIGNED', couponBookId: 'b1', code: 'X' } as any;
    couponCodeRepository.findByCode.mockResolvedValue(coupon);
    couponBookRepository.findById.mockResolvedValue({ id: 'b1' } as any);
    lockService.acquireLock.mockResolvedValue(null);
    lockService.getLockInfo.mockResolvedValue({ expiresAt: Date.now() + 5000 });

    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(HttpException);
  });

  it('locks successfully when acquireLock returns a lock', async () => {
    const coupon = { id: 'c1', status: 'ASSIGNED', couponBookId: 'b1', code: 'X' } as any;
    couponCodeRepository.findByCode.mockResolvedValue(coupon);
    couponBookRepository.findById.mockResolvedValue({ id: 'b1' } as any);
    lockService.acquireLock.mockResolvedValue({ lockId: 'l1' });
    couponCodeRepository.save.mockResolvedValue(undefined);

    const res = await useCase.execute({ code: 'X', userId: 'u1', ttlSeconds: 2 } as any);
    expect(res).toHaveProperty('code', 'X');
    expect(couponCodeRepository.save).toHaveBeenCalled();
  });
});
