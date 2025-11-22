export interface ICouponCodeRepository {
  findRandomAvailableWithLock(couponBookId: string): Promise<any | null>;
  save(couponCode: any): Promise<void>;
  findByCode(code: string): Promise<any | null>;
  bulkInsert(codes: string[], couponBookId: string): Promise<{ inserted: number; duplicates: string[] }>;
  findByUser(userId: string, options?: { status?: string }): Promise<any[]>;
}
