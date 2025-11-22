import { IsString, IsUUID, IsOptional } from 'class-validator';

export class RedeemCouponDto {
  @IsString()
  code: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  redemptionDetails?: any;
}
