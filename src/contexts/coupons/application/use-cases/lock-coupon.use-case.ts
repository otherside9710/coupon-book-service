import { Injectable, HttpException } from '@nestjs/common';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { Inject } from '@nestjs/common';
import { ILockServiceFull } from '../../domain/contracts/lock.service.port';
import { LockCouponDto } from '../dto/request/lock-coupon.dto';

@Injectable()
export class LockCouponUseCase {
  constructor(
    private readonly couponCodeRepository: CouponCodeRepository,
    private readonly couponBookRepository: CouponBookRepository,
    @Inject('ILockService') private readonly lockService: ILockServiceFull,
  ) {}

  async execute(dto: LockCouponDto) {
  const { code, userId, lockDurationSeconds = 300, ttlSeconds } = dto as any;
  // Accept either `lockDurationSeconds` or `ttlSeconds` from the client. `ttlSeconds` takes precedence.
  const durationSeconds = typeof ttlSeconds === 'number' ? ttlSeconds : lockDurationSeconds;
  // normalize and validate
  const lockSecs = Number.isInteger(durationSeconds) && durationSeconds > 0 ? durationSeconds : Math.max(1, Math.floor(Number(durationSeconds) || 0));
    const couponCode = await this.couponCodeRepository.findByCode(code);
    if (!couponCode) throw new Error('CouponCodeNotFound');

    // verify assigned to this user
    if (couponCode.assignedToUserId && couponCode.assignedToUserId !== userId) {
      throw new Error('CouponNotAssignedToUser');
    }

    const couponBook = await this.couponBookRepository.findById(couponCode.couponBookId);
    if (!couponBook) throw new Error('CouponBookNotFound');

    if (couponBook.validFrom && new Date() < new Date(couponBook.validFrom)) {
      throw new Error('CouponBookNotYetValid');
    }

    if (couponBook.validUntil && new Date() > new Date(couponBook.validUntil)) {
      throw new Error('CouponBookExpired');
    }

    const lockKey = `lock:coupon:${code}`;
  const lock = await this.lockService.acquireLock(lockKey, lockSecs * 1000, userId);
    if (!lock) {
      const existing = await this.lockService.getLockInfo(lockKey);
      if (existing) {
        const millisLeft = existing.expiresAt - Date.now();
        const secondsRemaining = millisLeft > 0 ? Math.ceil(millisLeft / 1000) : 0;
        throw new HttpException(
          {
            error: 'CouponAlreadyLocked',
            message: 'Coupon is currently locked by another user',
            secondsRemaining,
          },
          423,
        );
      }
      throw new HttpException({ error: 'UnableToAcquireLock', message: 'Could not acquire lock' }, 500);
    }

    // update coupon state
    couponCode.status = 'LOCKED';
    couponCode.lockedBy = userId;
  couponCode.lockedAt = new Date();
  // persist exact expiry based on the seconds the client requested
  couponCode.lockExpiresAt = new Date(Date.now() + lockSecs * 1000);
    await this.couponCodeRepository.save(couponCode);

    return { code: couponCode.code, status: couponCode.status, lockedBy: userId, lockedAt: couponCode.lockedAt, lockExpiresAt: couponCode.lockExpiresAt };
  }
}
