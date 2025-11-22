export interface ICouponBookRepository {
  findById(id: string): Promise<any | null>;
  save(couponBook: any): Promise<void>;
  deleteById(id: string): Promise<void>;
}
