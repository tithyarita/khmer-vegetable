import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToProduct20260520 implements MigrationInterface {
    name = 'AddStatusToProduct20260520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "status" character varying NOT NULL DEFAULT 'In Stock'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
    }
}
