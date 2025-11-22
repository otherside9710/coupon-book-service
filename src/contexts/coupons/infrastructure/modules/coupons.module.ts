import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from '../../../../apps/coupons/http/controllers/coupons.controller';
import { AssignRandomCouponUseCase } from '../../application/use-cases/assign-random-coupon.use-case';
import { AssignSpecificCouponUseCase } from '../../application/use-cases/assign-specific-coupon.use-case';
import { LockCouponUseCase } from '../../application/use-cases/lock-coupon.use-case';
import { RedeemCouponUseCase } from '../../application/use-cases/redeem-coupon.use-case';
import { UploadCodesUseCase } from '../../application/use-cases/upload-codes.use-case';
import { CreateCouponBookUseCase } from '../../application/use-cases/create-coupon-book.use-case';
import { GetUserCouponsUseCase } from '../../application/use-cases/get-user-coupons.use-case';
import { GetAllBooksUseCase } from '../../application/use-cases/get-all-books.use-case';
import { DeleteCouponBookUseCase } from '../../application/use-cases/delete-coupon-book.use-case';
import { CouponCodeRepository } from '../adapters/persistence/typeorm/repositories/coupon-code.repository';
import { CouponBookRepository } from '../adapters/persistence/typeorm/repositories/coupon-book.repository';
import { CouponCodeOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-code.orm-entity';
import { CouponBookOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-book.orm-entity';
import { CouponAssignmentOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-assignment.orm-entity';
import { CouponRedemptionOrmEntity } from '../adapters/persistence/typeorm/entities/coupon-redemption.orm-entity';
import { UsersController } from '../../../../apps/coupons/http/controllers/users.controller';
import { DatabaseModule } from '../database/database.module';
import { RedisLockService } from '../adapters/locking/redis-lock.service';
import { AssignmentRepository } from '../adapters/persistence/typeorm/repositories/assignment.repository';
import { RedemptionRepository } from '../adapters/persistence/typeorm/repositories/redemption.repository';
import { HealthController } from '@/apps/coupons/http/controllers/health.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([CouponCodeOrmEntity, CouponBookOrmEntity, CouponAssignmentOrmEntity, CouponRedemptionOrmEntity]),
  ],
  controllers: [CouponsController, UsersController, HealthController],
  providers: [
    AssignRandomCouponUseCase,
    AssignSpecificCouponUseCase,
    LockCouponUseCase,
    RedeemCouponUseCase,
    UploadCodesUseCase,
    CreateCouponBookUseCase,
    GetUserCouponsUseCase,
  DeleteCouponBookUseCase,
    GetAllBooksUseCase,
    CouponCodeRepository,
    CouponBookRepository,
    {
      provide: 'ILockService',
      useClass: RedisLockService,
    },
    AssignmentRepository,
    RedemptionRepository,
  ],
  exports: [
    CouponCodeRepository,
    CouponBookRepository,
    {
      provide: 'ILockService',
      useClass: RedisLockService,
    },
    AssignmentRepository,
    RedemptionRepository,
  ],
})
export class CouponsModule {}
