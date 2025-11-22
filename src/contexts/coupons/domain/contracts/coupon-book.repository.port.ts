export interface ICouponBookRepository {
  findById(id: string): Promise<any | null>;
  save(couponBook: any): Promise<void>;
}
