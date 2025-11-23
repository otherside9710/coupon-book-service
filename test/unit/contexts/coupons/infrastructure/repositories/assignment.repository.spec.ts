import { AssignmentRepository } from '@/contexts/coupons/infrastructure/adapters/persistence/typeorm/repositories/assignment.repository';

describe('AssignmentRepository', () => {
  let repo: any;
  let repository: AssignmentRepository;

  beforeEach(() => {
    repo = {
      create: jest.fn().mockImplementation((obj) => obj),
      save: jest.fn(),
      count: jest.fn(),
    };
    repository = new AssignmentRepository(repo as any);
  });

  it('save creates entity and calls repo.save', async () => {
    const assignment = { id: 'a1', couponCodeId: 'c1', userId: 'u1', couponBookId: 'b1' } as any;
    await repository.save(assignment);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('countByUserAndBook returns repo.count result', async () => {
    repo.count.mockResolvedValue(5);
    await expect(repository.countByUserAndBook('u1', 'b1')).resolves.toBe(5);
    expect(repo.count).toHaveBeenCalledWith({ where: { userId: 'u1', couponBookId: 'b1' } });
  });
});
