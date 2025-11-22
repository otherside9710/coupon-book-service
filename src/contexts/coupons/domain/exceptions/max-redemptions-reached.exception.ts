export class MaxRedemptionsReachedException extends Error {
  constructor(userId: string, bookId: string) {
    super(`User ${userId} has reached max redemptions for book ${bookId}`);
    this.name = 'MaxRedemptionsReachedException';
  }
}
