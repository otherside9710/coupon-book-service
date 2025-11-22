import { IsString, IsOptional, IsUUID, IsInt } from 'class-validator';

export class CreateCouponBookDto {
  @IsString()
  name: string;

  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsInt()
  totalCodes?: number;
}
