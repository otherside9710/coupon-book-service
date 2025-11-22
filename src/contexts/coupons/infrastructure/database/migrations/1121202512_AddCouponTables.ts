import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCouponTables1700635200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create coupon_books table first
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupon_books (
        id uuid PRIMARY KEY,
        name varchar(255),
        total_codes int DEFAULT 0,
        available_codes int DEFAULT 0,
        valid_from timestamp,
        valid_until timestamp,
        max_codes_per_user int,
        allow_multiple_redemptions_per_user boolean DEFAULT false,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // Create coupon_codes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupon_codes (
        id uuid PRIMARY KEY,
        code varchar(255) UNIQUE NOT NULL,
        coupon_book_id uuid NOT NULL REFERENCES coupon_books(id),
        status varchar(64) DEFAULT 'available',
        locked_by uuid,
        locked_at timestamp,
        lock_expires_at timestamp,
        redeemed_at timestamp,
        redeemed_by_user_id uuid,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_codes_book_id 
      ON coupon_codes(coupon_book_id)
    `);

    // Create assignments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupon_assignments (
        id uuid PRIMARY KEY,
        coupon_code_id uuid NOT NULL REFERENCES coupon_codes(id),
        user_id uuid NOT NULL,
        coupon_book_id uuid NOT NULL REFERENCES coupon_books(id),
        assigned_at timestamp NOT NULL DEFAULT now(),
        assignment_method varchar(64)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_assignments_user_book 
      ON coupon_assignments(user_id, coupon_book_id)
    `);

    // Create redemptions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id uuid PRIMARY KEY,
        coupon_code_id uuid NOT NULL REFERENCES coupon_codes(id),
        user_id uuid NOT NULL,
        coupon_book_id uuid NOT NULL REFERENCES coupon_books(id),
        redemption_details jsonb,
        redeemed_at timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_book 
      ON coupon_redemptions(user_id, coupon_book_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: drop redemptions table
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_coupon_redemptions_user_book
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS coupon_redemptions
    `);

    // Rollback: drop assignments table
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_coupon_assignments_user_book
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS coupon_assignments
    `);

    // Rollback: drop coupon_codes table
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_coupon_codes_book_id
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS coupon_codes
    `);

    // Rollback: drop coupon_books table
    await queryRunner.query(`
      DROP TABLE IF EXISTS coupon_books
    `);
  }
}
