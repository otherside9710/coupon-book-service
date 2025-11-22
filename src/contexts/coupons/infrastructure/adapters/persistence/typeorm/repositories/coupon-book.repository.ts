import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponBookOrmEntity } from '../entities/coupon-book.orm-entity';
import { CouponBookMapper } from '../mappers/coupon-book.mapper';
import { ICouponBookRepository } from '@/contexts/coupons/domain/contracts/coupon-book.repository.port';

@Injectable()
export class CouponBookRepository implements ICouponBookRepository {
  constructor(
    @InjectRepository(CouponBookOrmEntity)
    private readonly repo: Repository<CouponBookOrmEntity>,
  ) {}

  async findById(id: string) {
    const couponBook = await this.repo.findOne({ where: { id } });
    if (!couponBook) return null;
    return CouponBookMapper.toDomain(couponBook as any);
  }

  async findAll() {
    const books = await this.repo.find();
    return books.map((b) => CouponBookMapper.toDomain(b as any));
  }

  async save(couponBook: any): Promise<void> {
    const orm = CouponBookMapper.toOrm(couponBook as any);
    await this.repo.save(orm as any);
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
