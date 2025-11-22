import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Solo para TypeORM CLI. En runtime, las migraciones ya están ejecutadas.
const isMigrationRun = process.argv.includes('migration');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coupon_service',
  synchronize: false,
  logging: false,
  // Only load migrations when running TypeORM CLI commands
  ...(isMigrationRun && {
    migrations: [require('./1121202512_AddCouponTables').AddCouponTables1700635200000],
  }),
});
