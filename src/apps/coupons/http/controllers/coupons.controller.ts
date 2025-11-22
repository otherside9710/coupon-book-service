import { Body, Controller, Post, Param, Get, Query } from '@nestjs/common';
import { AssignCouponDto } from '../../../../contexts/coupons/application/dto/request/assign-coupon.dto';
import { AssignRandomCouponUseCase } from '../../../../contexts/coupons/application/use-cases/assign-random-coupon.use-case';
import { AssignSpecificCouponUseCase } from '../../../../contexts/coupons/application/use-cases/assign-specific-coupon.use-case';
import { LockCouponUseCase } from '../../../../contexts/coupons/application/use-cases/lock-coupon.use-case';
import { RedeemCouponUseCase } from '../../../../contexts/coupons/application/use-cases/redeem-coupon.use-case';
import { UploadCodesUseCase } from '../../../../contexts/coupons/application/use-cases/upload-codes.use-case';
import { CreateCouponBookUseCase } from '../../../../contexts/coupons/application/use-cases/create-coupon-book.use-case';
import { GetAllBooksUseCase } from '../../../../contexts/coupons/application/use-cases/get-all-books.use-case';

@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly assignRandom: AssignRandomCouponUseCase,
    private readonly assignSpecific: AssignSpecificCouponUseCase,
    private readonly lockCoupon: LockCouponUseCase,
    private readonly redeemCoupon: RedeemCouponUseCase,
    private readonly uploadCodes: UploadCodesUseCase,
    private readonly createCouponBook: CreateCouponBookUseCase,
    private readonly getAllBooksUseCase: GetAllBooksUseCase,
  ) {}

  @Get()
  async listAll() {
    return this.getAllBooksUseCase.execute();
  }

  @Post()
  async create(@Body() dto: any) {
    return this.createCouponBook.execute(dto);
  }

  @Post(':couponBookId/codes')
  async uploadCodesEndpoint(@Param('couponBookId') couponBookId: string, @Body() body: any) {
    return this.uploadCodes.execute({ ...body, couponBookId });
  }

  @Post('assign')
  async assign(@Body() dto: AssignCouponDto) {
    return this.assignRandom.execute(dto);
  }

  @Post('assign/:code')
  async assignSpecificEndpoint(@Param('code') code: string, @Body() body: any) {
    return this.assignSpecific.execute({ ...body, code });
  }

  @Post('lock/:code')
  async lockEndpoint(@Param('code') code: string, @Body() body: any) {
    return this.lockCoupon.execute({ ...body, code });
  }

  @Post('redeem/:code')
  async redeemEndpoint(@Param('code') code: string, @Body() body: any) {
    return this.redeemCoupon.execute({ ...body, code });
  }
}
