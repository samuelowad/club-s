import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupRls1702225548000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['event', 'user'];

    // Drop the current_club_id function if it exists
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS current_club_id() CASCADE;
    `);

    for (const table of tables) {
      // Drop all possible policy names we've used
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_policy ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_isolation ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_select ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_insert ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_update ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_delete ON "${table}";`);

      // Disable RLS on the table
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
      
      // Remove force RLS
      await queryRunner.query(`ALTER TABLE "${table}" NO FORCE ROW LEVEL SECURITY;`);
    }

    // Drop any session variables or custom settings
    await queryRunner.query(`
      DO $$
      BEGIN
        PERFORM pg_catalog.set_config('app.current_club_id', NULL, true);
      EXCEPTION WHEN OTHERS THEN
        -- Parameter might not exist, which is fine
        NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Since this is a cleanup migration, the down migration will do nothing
    // as we don't want to recreate potentially broken RLS setup
    return;
  }
}
