import { QueryRunner } from 'typeorm';
import {AppDataSource} from "../index";
import config from "../../config";

export async function withRLSContext<T>(
    clubId: string,
    operation: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        await queryRunner.query(`SET ROLE ${config.POSTGRESS_NON_ROOT_USER};`);
        await queryRunner.query(`SET LOCAL app.current_club_id TO ${+clubId}`);

        const result = await operation(queryRunner);

        await queryRunner.commitTransaction();
        return result;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}
