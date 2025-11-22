import { IsUUID, IsString, IsOptional, IsInt } from 'class-validator';

export class LockCouponDto {
  @IsString()
  code: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsInt()
  lockDurationSeconds?: number;
}
