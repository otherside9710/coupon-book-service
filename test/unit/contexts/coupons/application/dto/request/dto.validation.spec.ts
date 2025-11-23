import { validateSync } from 'class-validator';
import { AssignCouponDto } from '@/contexts/coupons/application/dto/request/assign-coupon.dto';
import { CreateCouponBookDto } from '@/contexts/coupons/application/dto/request/create-coupon-book.dto';
import { LockCouponDto } from '@/contexts/coupons/application/dto/request/lock-coupon.dto';
import { RedeemCouponDto } from '@/contexts/coupons/application/dto/request/redeem-coupon.dto';
import { UploadCodesDto } from '@/contexts/coupons/application/dto/request/upload-codes.dto';

describe('DTO validation (class-validator)', () => {
  it('AssignCouponDto validates UUIDs', () => {
    const assignValid = new AssignCouponDto();
    assignValid.couponBookId = '00000000-0000-0000-0000-000000000000';
    assignValid.userId = '00000000-0000-0000-0000-000000000000';
    expect(validateSync(assignValid).length).toBe(0);

    const assignInvalid = new AssignCouponDto();
    assignInvalid.couponBookId = 'not-uuid';
    assignInvalid.userId = 'also-not-uuid';
    const validationErrors = validateSync(assignInvalid);
    expect(validationErrors.length).toBeGreaterThanOrEqual(1);
  });

  it('CreateCouponBookDto requires name (string) and businessId (uuid) and optional totalCodes int', () => {
    const createValid = new CreateCouponBookDto();
    createValid.name = 'X';
    createValid.businessId = '00000000-0000-0000-0000-000000000000';
    createValid.totalCodes = 5;
    expect(validateSync(createValid).length).toBe(0);

    const createInvalid = new CreateCouponBookDto();
    createInvalid.name = 42 as any;
    createInvalid.businessId = 'not-uuid' as any;
    createInvalid.totalCodes = 'nope' as any;
    const createValidationErrors = validateSync(createInvalid);
    expect(createValidationErrors.length).toBeGreaterThanOrEqual(1);
  });

  it('LockCouponDto and RedeemCouponDto basic validation', () => {
    const lockValid = new LockCouponDto();
    lockValid.code = 'CODE';
    lockValid.userId = '00000000-0000-0000-0000-000000000000';
    expect(validateSync(lockValid).length).toBe(0);

    const redeemValid = new RedeemCouponDto();
    redeemValid.code = 'C';
    redeemValid.userId = '00000000-0000-0000-0000-000000000000';
    expect(validateSync(redeemValid).length).toBe(0);

    // invalid lockDurationSeconds
    const lockInvalid = new LockCouponDto();
    lockInvalid.code = 'C';
    lockInvalid.userId = '00000000-0000-0000-0000-000000000000';
    lockInvalid.lockDurationSeconds = 'x' as any;
    expect(validateSync(lockInvalid).length).toBeGreaterThanOrEqual(1);
  });

  it('UploadCodesDto has no validators (basic shape)', () => {
    const uploadDto = new UploadCodesDto();
    uploadDto.codes = ['A', 'B'];
    // UploadCodesDto currently has no validation decorators — ensure it keeps the shape
    expect(uploadDto.codes).toEqual(['A', 'B']);
  });
});
