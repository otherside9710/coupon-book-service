import { Injectable } from '@nestjs/common';
import { CouponCodeRepository } from '../../infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { UserCouponsResponse } from '../dto/response/user-coupons.response';

@Injectable()
export class GetUserCouponsUseCase {
  constructor(private readonly couponCodeRepository: CouponCodeRepository) { }

  async execute(userId: string, filters?: { status?: string; couponBookId?: string }) {
    const codes = await this.couponCodeRepository.findByUser(userId, { status: filters?.status });
    const resp = new UserCouponsResponse();
    resp.data = codes.map((c) => ({
      id: c.id,
      code: c.code,
      status: c.status,
      assignedAt: c.assignedAt,
      couponBookId: c.couponBookId,
      assignedToUserId: c.assignedToUserId,
      lockedBy: (c as any).lockedBy,
      lockedAt: (c as any).lockedAt,
      lockExpiresAt: (c as any).lockExpiresAt,
      redeemedAt: (c as any).redeemedAt,
      redeemedByUserId: (c as any).redeemedByUserId,
    }));
    resp.userId = userId;
    return resp;
  }
}
