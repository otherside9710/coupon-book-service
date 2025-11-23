import { RedemptionRepository } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/repositories/redemption.repository';

describe('RedemptionRepository', () => {
  let repo: any;
  let repository: RedemptionRepository;

  beforeEach(() => {
    repo = {
      create: jest.fn().mockImplementation((obj) => obj),
      save: jest.fn(),
      count: jest.fn(),
    };
    repository = new RedemptionRepository(repo as any);
  });

  it('save creates entity and calls repo.save', async () => {
    const redemption = { id: 'r1', couponCodeId: 'c1', userId: 'u1', couponBookId: 'b1' } as any;
    await repository.save(redemption);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('countByUserAndBook returns repo.count result', async () => {
    repo.count.mockResolvedValue(3);
    await expect(repository.countByUserAndBook('u1', 'b1')).resolves.toBe(3);
    expect(repo.count).toHaveBeenCalledWith({ where: { userId: 'u1', couponBookId: 'b1' } });
  });
});
