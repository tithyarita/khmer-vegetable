import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarToUsers20260520 implements MigrationInterface {
  name = 'AddAvatarToUsers20260520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar" character varying NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
  }
}
