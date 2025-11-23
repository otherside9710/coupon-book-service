import { GetAllBooksUseCase } from '@/contexts/coupons/application/use-cases/get-all-books.use-case';

describe('GetAllBooksUseCase', () => {
  let useCase: GetAllBooksUseCase;
  let couponBookRepository: any;
  let couponCodeRepository: any;

  beforeEach(() => {
    couponBookRepository = { findAll: jest.fn() };
    couponCodeRepository = { findByBook: jest.fn() };
    useCase = new GetAllBooksUseCase(couponBookRepository, couponCodeRepository);
  });

  it('maps books and codes correctly', async () => {
    const books = [{ id: 'b1', name: 'B' } as any];
    const codes = [{ id: 'c1', code: 'X', status: 'AVAILABLE' } as any];
    couponBookRepository.findAll.mockResolvedValue(books);
    couponCodeRepository.findByBook.mockResolvedValue(codes);

    const res = await useCase.execute();
    expect(res).toHaveLength(1);
    expect(res[0]).toHaveProperty('codes');
    expect(res[0].codes[0].code).toBe('X');
  });
});
