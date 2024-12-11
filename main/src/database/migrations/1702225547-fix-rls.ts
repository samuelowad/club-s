import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRls1702225547000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['event', 'user'];

    for (const table of tables) {
      // First remove all existing policies
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_policy ON "${table}";`);

      // Disable RLS temporarily
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
    }

    // Drop and recreate the function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION current_club_id()
      RETURNS TEXT AS $$
      BEGIN
          RETURN current_setting('app.current_club_id', true);
      END;
      $$ LANGUAGE plpgsql STABLE;
    `);

    for (const table of tables) {
      // Enable RLS
      console.log(`Enabling RLS for table ${table}`);
      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);

      // Create a single restrictive policy
      console.log(`Creating restrictive policy for table ${table}`);
      await queryRunner.query(`
        CREATE POLICY ${table}_tenant_policy ON "${table}"
        FOR ALL
        TO public
        USING (
          "clubId"::TEXT = current_club_id()
        )
        WITH CHECK (
          "clubId"::TEXT = current_club_id()
        );
      `);

      // Force RLS
      await queryRunner.query(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['event', 'user'];

    for (const table of tables) {
      // Remove the restrictive policy
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_policy ON "${table}";`);

      // Disable RLS
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
    }

    // Drop the function last
    await queryRunner.query('DROP FUNCTION IF EXISTS current_club_id();');
  }
}
