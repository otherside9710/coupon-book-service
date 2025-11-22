import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './migrations/data-source';
import { CouponBookOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-book.orm-entity';
import { CouponCodeOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-code.orm-entity';
import { CouponAssignmentOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-assignment.orm-entity';
import { CouponRedemptionOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-redemption.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      entities: [
        CouponBookOrmEntity,
        CouponCodeOrmEntity,
        CouponAssignmentOrmEntity,
        CouponRedemptionOrmEntity,
      ],
      synchronize: false, // Use migrations instead
    } as any),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
