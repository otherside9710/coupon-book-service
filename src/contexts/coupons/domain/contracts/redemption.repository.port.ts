export interface IRedemptionRepository {
  save(redemption: any): Promise<void>;
  countByUserAndBook(userId: string, bookId: string): Promise<number>;
}
