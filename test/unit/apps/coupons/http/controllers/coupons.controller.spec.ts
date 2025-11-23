import { CouponsController } from '@/apps/coupons/http/controllers/coupons.controller';
import { NotFoundException } from '@nestjs/common';
import { CouponBookNotFoundException } from '@/contexts/coupons/domain/exceptions/coupon-book-not-found.exception';

describe('CouponsController', () => {
  let controller: CouponsController;
  let assignRandom: any;
  let assignSpecific: any;
  let lockCoupon: any;
  let redeemCoupon: any;
  let uploadCodes: any;
  let createCouponBook: any;
  let getAllBooksUseCase: any;
  let deleteCouponBook: any;

  beforeEach(() => {
    assignRandom = { execute: jest.fn() };
    assignSpecific = { execute: jest.fn() };
    lockCoupon = { execute: jest.fn() };
    redeemCoupon = { execute: jest.fn() };
    uploadCodes = { execute: jest.fn() };
    createCouponBook = { execute: jest.fn() };
    getAllBooksUseCase = { execute: jest.fn() };
    deleteCouponBook = { execute: jest.fn() };

    controller = new CouponsController(
      assignRandom,
      assignSpecific,
      lockCoupon,
      redeemCoupon,
      uploadCodes,
      createCouponBook,
      getAllBooksUseCase,
      deleteCouponBook,
    );
  });

  it('listAll calls getAllBooksUseCase and returns value', async () => {
    const expected = [{ id: 'b1' }];
    getAllBooksUseCase.execute.mockResolvedValue(expected);

    await expect(controller.listAll()).resolves.toEqual(expected);
    expect(getAllBooksUseCase.execute).toHaveBeenCalled();
  });

  it('create forwards dto to createCouponBook and returns result', async () => {
    const dto = { name: 'X' };
    const created = { id: 'book1', name: 'X' };
    createCouponBook.execute.mockResolvedValue(created);

    await expect(controller.create(dto)).resolves.toEqual(created);
    expect(createCouponBook.execute).toHaveBeenCalledWith(dto);
  });

  it('uploadCodesEndpoint merges couponBookId into body and calls uploadCodes', async () => {
    const body = { codes: ['A'] };
    const couponBookId = 'book-123';
    const result = { uploaded: 1 };
    uploadCodes.execute.mockResolvedValue(result);

    await expect(controller.uploadCodesEndpoint(couponBookId, body)).resolves.toEqual(result);
    expect(uploadCodes.execute).toHaveBeenCalledWith({ ...body, couponBookId });
  });

  it('assign calls assignRandom use-case with dto', async () => {
    const dto = { userId: 'u1', couponBookId: 'book-x' };
    const assigned = { code: 'C1' };
    assignRandom.execute.mockResolvedValue(assigned);

    await expect(controller.assign(dto)).resolves.toEqual(assigned);
    expect(assignRandom.execute).toHaveBeenCalledWith(dto);
  });

  it('assignSpecificEndpoint forwards code and body', async () => {
    const body = { userId: 'u2' };
    const code = 'CODE-1';
    const resp = { assigned: true };
    assignSpecific.execute.mockResolvedValue(resp);

    await expect(controller.assignSpecificEndpoint(code, body)).resolves.toEqual(resp);
    expect(assignSpecific.execute).toHaveBeenCalledWith({ ...body, code });
  });

  it('lockEndpoint forwards code and body to lockCoupon', async () => {
    const body = { userId: 'u3' };
    const code = 'LOCK1';
    const resp = { locked: true };
    lockCoupon.execute.mockResolvedValue(resp);

    await expect(controller.lockEndpoint(code, body)).resolves.toEqual(resp);
    expect(lockCoupon.execute).toHaveBeenCalledWith({ ...body, code });
  });

  it('redeemEndpoint forwards code and body to redeemCoupon', async () => {
    const body = { userId: 'u4' };
    const code = 'R1';
    const resp = { redeemed: true };
    redeemCoupon.execute.mockResolvedValue(resp);

    await expect(controller.redeemEndpoint(code, body)).resolves.toEqual(resp);
    expect(redeemCoupon.execute).toHaveBeenCalledWith({ ...body, code });
  });

  it('propagates errors from use-cases (example assign)', async () => {
    const dto = { userId: 'u5', couponBookId: 'book-x' };
    const err = new Error('use-case failure');
    assignRandom.execute.mockRejectedValue(err);

    await expect(controller.assign(dto)).rejects.toBe(err);
  });

  it('deleteCouponBookEndpoint returns undefined (204) when deletion succeeds', async () => {
    deleteCouponBook.execute.mockResolvedValue(undefined);

    await expect(controller.deleteCouponBookEndpoint('some-id')).resolves.toBeUndefined();
    expect(deleteCouponBook.execute).toHaveBeenCalledWith('some-id');
  });

  it('deleteCouponBookEndpoint throws NotFoundException when use-case throws CouponBookNotFoundException', async () => {
    deleteCouponBook.execute.mockRejectedValue(new CouponBookNotFoundException());

    await expect(controller.deleteCouponBookEndpoint('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
