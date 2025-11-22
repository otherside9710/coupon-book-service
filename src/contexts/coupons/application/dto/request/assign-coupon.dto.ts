import { IsUUID } from 'class-validator';

export class AssignCouponDto {
  @IsUUID()
  couponBookId: string;

  @IsUUID()
  userId: string;
}
