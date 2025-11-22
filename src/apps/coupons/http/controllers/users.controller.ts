import { Controller, Get, Param } from '@nestjs/common';
import { GetUserCouponsUseCase } from '../../../../contexts/coupons/application/use-cases/get-user-coupons.use-case';

@Controller('users')
export class UsersController {
  constructor(private readonly getUserCoupons: GetUserCouponsUseCase) {}

  @Get(':userId/coupons')
  async listUserCoupons(@Param('userId') userId: string) {
    return this.getUserCoupons.execute(userId);
  }
}
