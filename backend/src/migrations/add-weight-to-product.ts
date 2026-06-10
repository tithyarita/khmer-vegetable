import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeightToProduct1696780000000 implements MigrationInterface {
  name = 'AddWeightToProduct1696780000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE product ADD COLUMN weight VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE product DROP COLUMN weight
    `);
  }
}
