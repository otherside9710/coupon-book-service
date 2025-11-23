import { CouponBookRepository } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/repositories/coupon-book.repository';
import { CouponBookMapper } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/mappers/coupon-book.mapper';

describe('CouponBookRepository', () => {
  let repo: any;
  let repository: CouponBookRepository;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    repository = new CouponBookRepository(repo as any);
  });

  it('findById returns mapped domain or null', async () => {
    const orm = { id: 'b1' } as any;
    const domain = { id: 'b1', isDomain: true } as any;
    jest.spyOn(CouponBookMapper, 'toDomain').mockReturnValue(domain);

    repo.findOne.mockResolvedValue(orm);
    await expect(repository.findById('b1')).resolves.toEqual(domain);
    expect(CouponBookMapper.toDomain).toHaveBeenCalledWith(orm);

    repo.findOne.mockResolvedValue(undefined);
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('findAll maps all results', async () => {
    const ormArray = [{ id: 'b1' }, { id: 'b2' }];
    const domainArray = [{ id: 'b1' }, { id: 'b2' }];
  jest.spyOn(CouponBookMapper, 'toDomain').mockImplementation((x) => x as any);

  // clear any previous calls from other tests
  (CouponBookMapper.toDomain as jest.Mock).mockClear();

  repo.find.mockResolvedValue(ormArray);
  await expect(repository.findAll()).resolves.toEqual(domainArray);
  expect(CouponBookMapper.toDomain).toHaveBeenCalledTimes(ormArray.length);
  });

  it('save forwards to repo.save after mapping to orm', async () => {
    const domain = { id: 'b1' } as any;
    const orm = { id: 'b1' } as any;
    jest.spyOn(CouponBookMapper, 'toOrm').mockReturnValue(orm);

    await repository.save(domain);
    expect(CouponBookMapper.toOrm).toHaveBeenCalledWith(domain);
    expect(repo.save).toHaveBeenCalledWith(orm);
  });

  it('deleteById calls repo.delete', async () => {
    await repository.deleteById('b1');
    expect(repo.delete).toHaveBeenCalledWith('b1');
  });
});
