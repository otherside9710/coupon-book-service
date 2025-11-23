import { UsersController } from '@/apps/coupons/http/controllers/users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let getUserCoupons: any;

  beforeEach(() => {
    getUserCoupons = { execute: jest.fn() };
    controller = new UsersController(getUserCoupons);
  });

  it('calls use-case with userId and returns value', async () => {
    const expected = [{ code: 'ABC123' }];
    getUserCoupons.execute.mockResolvedValue(expected);

    await expect(controller.listUserCoupons('user-1')).resolves.toEqual(expected);
    expect(getUserCoupons.execute).toHaveBeenCalledWith('user-1');
  });

  it('propagates errors from use-case', async () => {
    const err = new Error('boom');
    getUserCoupons.execute.mockRejectedValue(err);

    await expect(controller.listUserCoupons('user-2')).rejects.toBe(err);
  });
});
