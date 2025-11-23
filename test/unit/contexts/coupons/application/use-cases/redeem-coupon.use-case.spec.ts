import { RedeemCouponUseCase } from '@/contexts/coupons/application/use-cases/redeem-coupon.use-case';
import { NotFoundException, ForbiddenException, HttpException, BadRequestException, ConflictException } from '@nestjs/common';

describe('RedeemCouponUseCase', () => {
  let useCase: RedeemCouponUseCase;
  let couponCodeRepo: any;
  let couponBookRepo: any;
  let redemptionRepo: any;
  let lockService: any;

  beforeEach(() => {
    couponCodeRepo = { findByCode: jest.fn(), save: jest.fn() };
    couponBookRepo = { findById: jest.fn(), save: jest.fn() };
    redemptionRepo = { countByUserAndBook: jest.fn(), save: jest.fn() };
    lockService = { getLockInfo: jest.fn(), acquireLock: jest.fn(), releaseLock: jest.fn() };

    useCase = new RedeemCouponUseCase(
      couponCodeRepo,
      couponBookRepo,
      redemptionRepo,
      lockService as any,
    );
  });

  it('throws NotFoundException when coupon code not found', async () => {
    couponCodeRepo.findByCode.mockResolvedValue(null);
    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when coupon assigned to different user', async () => {
    couponCodeRepo.findByCode.mockResolvedValue({ id: 'c1', assignedToUserId: 'other' } as any);
    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws HttpException when distributed lock exists', async () => {
    const coupon = { id: 'c1', assignedToUserId: 'u1', status: 'ASSIGNED', couponBookId: 'b1' } as any;
    couponCodeRepo.findByCode.mockResolvedValue(coupon);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1', allowMultipleRedemptionsPerUser: true } as any);
    lockService.getLockInfo.mockResolvedValue({ expiresAt: Date.now() + 5000 });

    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(HttpException);
  });

  it('cleans expired distributed lock and proceeds', async () => {
    const now = Date.now();
    couponCodeRepo.findByCode.mockResolvedValue({ id: 'c1', assignedToUserId: 'u1', couponBookId: 'b1', status: 'ASSIGNED' } as any);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1', allowMultipleRedemptionsPerUser: true, availableCodes: 2 } as any);
    lockService.getLockInfo.mockResolvedValue({ resource: 'x', owner: 'o', expiresAt: now - 1000 });
    lockService.releaseLock.mockResolvedValue(undefined);
    lockService.acquireLock.mockResolvedValue({ lockId: 'l1' });

    redemptionRepo.save.mockResolvedValue(undefined);
    couponCodeRepo.save.mockResolvedValue(undefined);
    couponBookRepo.save.mockResolvedValue(undefined);

    const res = await useCase.execute({ code: 'X', userId: 'u1', redemptionDetails: { a: 1 } } as any);
    expect(res).toHaveProperty('code');
    expect(lockService.releaseLock).toHaveBeenCalled();
  });

  it('throws when DB lock not expired (status LOCKED)', async () => {
    const future = Date.now() + 5000;
    couponCodeRepo.findByCode.mockResolvedValue({ id: 'c1', assignedToUserId: 'u1', couponBookId: 'b1', status: 'LOCKED', lockExpiresAt: new Date(future).toISOString() } as any);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1' } as any);
    lockService.getLockInfo.mockResolvedValue(null);

    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(HttpException);
  });

  it('clears expired DB lock and continues', async () => {
    const past = Date.now() - 5000;
    const coupon = { id: 'c1', assignedToUserId: 'u1', couponBookId: 'b1', status: 'LOCKED', lockExpiresAt: new Date(past).toISOString() } as any;
    couponCodeRepo.findByCode.mockResolvedValue(coupon);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1', allowMultipleRedemptionsPerUser: true, availableCodes: 1 } as any);
    lockService.getLockInfo.mockResolvedValue(null);
    couponCodeRepo.save.mockResolvedValue(undefined);
    lockService.acquireLock.mockResolvedValue({ lockId: 'l1' });
    redemptionRepo.save.mockResolvedValue(undefined);
    couponBookRepo.save.mockResolvedValue(undefined);

    const out = await useCase.execute({ code: 'X', userId: 'u1' } as any);
    expect(out.status).toBe('REDEEMED');
  });

  it('enforces redemption limits', async () => {
    couponCodeRepo.findByCode.mockResolvedValue({ id: 'c1', assignedToUserId: 'u1', couponBookId: 'b1', status: 'ASSIGNED' } as any);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1', allowMultipleRedemptionsPerUser: false } as any);
    lockService.getLockInfo.mockResolvedValue(null);
    redemptionRepo.countByUserAndBook.mockResolvedValue(1);

    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when already redeemed', async () => {
    couponCodeRepo.findByCode.mockResolvedValue({ id: 'c1', assignedToUserId: 'u1', couponBookId: 'b1', status: 'REDEEMED' } as any);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1' } as any);
    lockService.getLockInfo.mockResolvedValue(null);
    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when acquireLock fails (concurrent)', async () => {
    couponCodeRepo.findByCode.mockResolvedValue({ id: 'c1', assignedToUserId: 'u1', couponBookId: 'b1', status: 'ASSIGNED' } as any);
    couponBookRepo.findById.mockResolvedValue({ id: 'b1', allowMultipleRedemptionsPerUser: true } as any);
    lockService.getLockInfo.mockResolvedValue(null);
    lockService.acquireLock.mockResolvedValue(null);

    await expect(useCase.execute({ code: 'X', userId: 'u1' } as any)).rejects.toBeInstanceOf(HttpException);
  });
});