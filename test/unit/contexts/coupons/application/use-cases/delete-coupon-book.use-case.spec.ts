import { DeleteCouponBookUseCase } from '@/contexts/coupons/application/use-cases/delete-coupon-book.use-case';
import { CouponBookNotFoundException } from '@/contexts/coupons/domain/exceptions/coupon-book-not-found.exception';

describe('DeleteCouponBookUseCase', () => {
  let useCase: DeleteCouponBookUseCase;
  let couponBookRepository: any;
  let couponCodeRepository: any;

  beforeEach(() => {
    couponBookRepository = {
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    couponCodeRepository = {
      deleteByBookId: jest.fn(),
    };

    useCase = new DeleteCouponBookUseCase(
      couponBookRepository,
      couponCodeRepository,
    );
  });

  it('throws CouponBookNotFoundException when book does not exist', async () => {
    couponBookRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toBeInstanceOf(
      CouponBookNotFoundException,
    );
  });

  it('deletes codes and then deletes the book when it exists', async () => {
    const id = 'existing-id';
    couponBookRepository.findById.mockResolvedValue({ id });
    couponCodeRepository.deleteByBookId.mockResolvedValue(undefined);
    couponBookRepository.deleteById.mockResolvedValue(undefined);

    await expect(useCase.execute(id)).resolves.toBeUndefined();

    expect(couponCodeRepository.deleteByBookId).toHaveBeenCalledTimes(1);
    expect(couponCodeRepository.deleteByBookId).toHaveBeenCalledWith(id);
    expect(couponBookRepository.deleteById).toHaveBeenCalledTimes(1);
    expect(couponBookRepository.deleteById).toHaveBeenCalledWith(id);
  });
});
