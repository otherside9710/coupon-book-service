import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, In, QueryFailedError } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponCodeOrmEntity } from '../entities/coupon-code.orm-entity';
import { CouponCodeMapper } from '../mappers/coupon-code.mapper';
import { ICouponCodeRepository } from '@/contexts/coupons/domain/contracts/coupon-code.repository.port';

@Injectable()
export class CouponCodeRepository implements ICouponCodeRepository {
  constructor(
    @InjectRepository(CouponCodeOrmEntity)
    private readonly repo: Repository<CouponCodeOrmEntity>,
    private readonly dataSource: DataSource,
  ) { }

  async findRandomAvailableWithLock(couponBookId: string) {
    // Detect actual column naming in DB before starting a transaction to avoid aborting it
    const hasSnakeCouponBook = await this.dataSource.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_codes' AND column_name = 'coupon_book_id' LIMIT 1",
    );
    const hasSnakeAssignedToUser = await this.dataSource.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_codes' AND column_name = 'assigned_to_user_id' LIMIT 1",
    );

    let couponBookCol: string;
    let assignedToUserCol: string;

    if (hasSnakeCouponBook.length > 0 && hasSnakeAssignedToUser.length > 0) {
      couponBookCol = 'coupon_book_id';
      assignedToUserCol = 'assigned_to_user_id';
    } else {
      // fallback to camelCase column names (quoted)
      const hasCamelCouponBook = await this.dataSource.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_codes' AND column_name = 'couponBookId' LIMIT 1",
      );
      const hasCamelAssignedToUser = await this.dataSource.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_codes' AND column_name = 'assignedToUserId' LIMIT 1",
      );

      if (hasCamelCouponBook.length > 0 && hasCamelAssignedToUser.length > 0) {
        couponBookCol = '"couponBookId"';
        assignedToUserCol = '"assignedToUserId"';
      } else {
        // schema mismatch
        throw new NotFoundException(`Coupon book with ID: ${couponBookId} not found or database schema mismatch`);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      const sql = `SELECT * FROM coupon_codes WHERE ${couponBookCol} = $1 AND status = 'AVAILABLE' AND ${assignedToUserCol} IS NULL ORDER BY RANDOM() LIMIT 1 FOR UPDATE SKIP LOCKED`;
      const row = await queryRunner.query(sql, [couponBookId]);

      if (!row || row.length === 0) {
        await queryRunner.commitTransaction();
        return null;
      }

      const orm = row[0];
      await queryRunner.commitTransaction();
      return CouponCodeMapper.toDomain(orm);
    } catch (err) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (_) {
        // ignore rollback error
      }
      if (err instanceof QueryFailedError) {
        throw new NotFoundException(`Coupon book with ID: ${couponBookId} not found or database schema mismatch`);
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async save(couponCode: any): Promise<void> {
    const orm = CouponCodeMapper.toOrm(couponCode as any);
    await this.repo.save(orm as any);
  }

  async bulkInsert(codes: string[], couponBookId: string): Promise<{ inserted: number; duplicates: string[] }> {
    if (!codes || codes.length === 0) return { inserted: 0, duplicates: [] };

    // filter out codes that already exist
    const existing = await this.repo.find({ where: { code: In(codes) }, select: ['code'] as any });
    const existingSet = new Set(existing.map((e: any) => e.code));
    const duplicates = codes.filter((c) => existingSet.has(c));
    const toInsert = codes.filter((c) => !existingSet.has(c));

    if (toInsert.length === 0) {
      return { inserted: 0, duplicates };
    }

    const rows = toInsert.map((c) => ({ id: uuidv4(), code: c, couponBookId }));

    // Use QueryBuilder with OR IGNORE (ON CONFLICT DO NOTHING) to avoid unique constraint errors
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(CouponCodeOrmEntity)
      .values(rows as any)
      .orIgnore()
      .execute();

    // We return the intended inserted count and duplicates found earlier. In rare race conditions
    // some of the `toInsert` items may have been inserted by another process; OR IGNORE avoids errors.
    return { inserted: rows.length, duplicates };
  }

  async findByCode(code: string) {
    const found = await this.repo.findOne({ where: { code } });
    if (!found) return null;
    return CouponCodeMapper.toDomain(found);
  }

  async findByBook(couponBookId: string): Promise<any[]> {
    const found = await this.repo.find({ where: { couponBookId } });
    return found.map((f) => CouponCodeMapper.toDomain(f));
  }

  async findByUser(userId: string, options?: { status?: string }): Promise<any[]> {
    const where: any = { assignedToUserId: userId };
    if (options?.status) where.status = options.status;
    const found = await this.repo.find({ where });
    return found.map((f) => CouponCodeMapper.toDomain(f));
  }
}
