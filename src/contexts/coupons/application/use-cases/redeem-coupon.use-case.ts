import { Injectable, HttpException, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { RedemptionRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/redemption.repository';
import { Inject } from '@nestjs/common';
import { ILockServiceFull } from '../../domain/contracts/lock.service.port';
import { RedeemCouponDto } from '../dto/request/redeem-coupon.dto';

@Injectable()
export class RedeemCouponUseCase {
  constructor(
    private readonly couponCodeRepository: CouponCodeRepository,
    private readonly couponBookRepository: CouponBookRepository,
    private readonly redemptionRepository: RedemptionRepository,
    @Inject('ILockService') private readonly lockService: ILockServiceFull,
  ) {}

  async execute(dto: RedeemCouponDto) {
    const { code, userId, redemptionDetails } = dto as any;
    const couponCode = await this.couponCodeRepository.findByCode(code);
    if (!couponCode) throw new NotFoundException('Coupon code not found');

    if (couponCode.assignedToUserId !== userId) {
      throw new ForbiddenException('Coupon not assigned to this user');
    }

    const couponBook = await this.couponBookRepository.findById(couponCode.couponBookId);
    if (!couponBook) throw new NotFoundException('Coupon book not found');
    // check distributed lock (Redis) first — even if DB status isn't updated
    const lockKeyGlobal = `lock:coupon:${code}`;
    const existingLock = await this.lockService.getLockInfo(lockKeyGlobal).catch(() => null);
    const millisLeft = existingLock ? existingLock.expiresAt - Date.now() : 0;
    const secondsRemaining = millisLeft > 0 ? Math.ceil(millisLeft / 1000) : 0;

    // If there's a distributed lock with remaining TTL, reject with 423 (treat lock as authoritative)
    if (existingLock && secondsRemaining > 0) {
      throw new HttpException(
        {
          error: 'CouponAlreadyLocked',
          message: 'Coupon is currently locked',
          secondsRemaining,
        },
        423,
      );
    }

    // If distributed lock exists but has expired (secondsRemaining === 0), attempt to cleanup and proceed
    if (existingLock && secondsRemaining === 0) {
      try {
        await this.lockService.releaseLock(lockKeyGlobal).catch(() => null);
      } catch (_) {
        // ignore
      }
    }

    // If DB shows LOCKED, check lockExpiresAt; if still in future return 423, otherwise clear DB lock state and continue
    if (couponCode.status === 'LOCKED') {
      const expires = couponCode.lockExpiresAt ? new Date(couponCode.lockExpiresAt).getTime() : 0;
      const now = Date.now();

      // if locked and not expired, reject with 423
      if (expires && expires > now) {
        const millisLeftDb = expires - now;
        const secondsRemainingDb = Math.ceil(millisLeftDb / 1000);
        throw new HttpException(
          {
            error: 'CouponAlreadyLocked',
            message: 'Coupon is currently locked',
            secondsRemaining: secondsRemainingDb,
          },
          423,
        );
      }

      // lock expired in DB -> clear lock fields and update status accordingly
      if (!expires || expires <= now) {
        couponCode.lockedBy = null;
        couponCode.lockedAt = null;
        couponCode.lockExpiresAt = null;
        // set status back to ASSIGNED if it was assigned, otherwise AVAILABLE
        couponCode.status = couponCode.assignedToUserId ? 'ASSIGNED' : 'AVAILABLE';
        await this.couponCodeRepository.save(couponCode);
      }
    }

    // enforce redemption limits per book
    if (!couponBook.allowMultipleRedemptionsPerUser) {
      const redeemedCount = await this.redemptionRepository.countByUserAndBook(userId, couponBook.id);
      if (redeemedCount > 0) throw new BadRequestException('Max redemptions reached for this user');
    }

    // check already redeemed
    if (couponCode.status === 'REDEEMED') throw new ConflictException('Coupon already redeemed');

  const lockKey = `redeem:coupon:${code}:user:${userId}`;
  const lock = await this.lockService.acquireLock(lockKey, 30000, userId);
  if (!lock) throw new HttpException({ error: 'ConcurrentRedemption', message: 'Concurrent redemption in progress' }, 409);

    try {
      // update coupon to redeemed
      couponCode.status = 'REDEEMED';
      couponCode.redeemedByUserId = userId as any;
      couponCode.redeemedAt = new Date();
      await this.couponCodeRepository.save(couponCode);

      // create redemption record
      const redemption = {
        id: uuidv4(),
        couponCodeId: couponCode.id,
        userId,
        couponBookId: couponBook.id,
        redemptionDetails,
        redeemedAt: new Date(),
      };

      await this.redemptionRepository.save(redemption);

      // update coupon book stats
      if (typeof couponBook.availableCodes === 'number') {
        couponBook.availableCodes = Math.max(0, couponBook.availableCodes - 1);
        await this.couponBookRepository.save(couponBook);
      }

      return {
        code: couponCode.code,
        status: couponCode.status,
        redeemedBy: userId,
        redeemedAt: couponCode.redeemedAt,
      };
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }
}
 
