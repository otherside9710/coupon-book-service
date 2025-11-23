import { CouponCodeRepository } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponCodeMapper } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/mappers/coupon-code.mapper';

describe('CouponCodeRepository', () => {
  let repo: any;
  let dataSource: any;
  let repository: CouponCodeRepository;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
      createQueryRunner: jest.fn(),
    } as any;

    repository = new CouponCodeRepository(repo as any, dataSource as any);
  });

  it('save maps to orm and calls repo.save', async () => {
    const domain = { code: 'X' } as any;
    const orm = { code: 'X' } as any;
    jest.spyOn(CouponCodeMapper, 'toOrm').mockReturnValue(orm);

    await repository.save(domain);
    expect(CouponCodeMapper.toOrm).toHaveBeenCalledWith(domain);
    expect(repo.save).toHaveBeenCalledWith(orm);
  });

  it('bulkInsert returns counts and duplicates', async () => {
    const codes = ['A', 'B', 'C'];
    // existing contains A
    repo.find.mockResolvedValue([{ code: 'A' }]);

    // mock query builder chain
    const qb: any = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };
    repo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.bulkInsert(codes, 'book1');
    expect(result.duplicates).toEqual(['A']);
    expect(result.inserted).toBe(2);
    expect(qb.execute).toHaveBeenCalled();
  });

  it('bulkInsert returns zero for empty input', async () => {
    const result = await repository.bulkInsert([], 'book1');
    expect(result).toEqual({ inserted: 0, duplicates: [] });
  });

  it('findByCode returns mapped domain or null', async () => {
    const orm = { code: 'X' } as any;
    const domain = { code: 'X' } as any;
    jest.spyOn(CouponCodeMapper, 'toDomain').mockReturnValue(domain);

    repo.findOne.mockResolvedValue(orm);
    await expect(repository.findByCode('X')).resolves.toEqual(domain);

    repo.findOne.mockResolvedValue(undefined);
    await expect(repository.findByCode('missing')).resolves.toBeNull();
  });

  it('findByBook and findByUser map results', async () => {
    const ormArr = [{ code: 'A' }, { code: 'B' }];
    jest.spyOn(CouponCodeMapper, 'toDomain').mockImplementation((x) => x as any);

    repo.find.mockResolvedValue(ormArr);
    await expect(repository.findByBook('book1')).resolves.toEqual(ormArr);
    await expect(repository.findByUser('user1')).resolves.toEqual(ormArr);
  });

  it('deleteByBookId calls repo.delete with where clause', async () => {
    await repository.deleteByBookId('book1');
    expect(repo.delete).toHaveBeenCalledWith({ couponBookId: 'book1' });
  });
});
