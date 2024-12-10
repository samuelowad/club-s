import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRls1702225547000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['event', 'user'];
    
    for (const table of tables) {
      // First remove all existing policies
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_isolation ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_select ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_insert ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_update ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_delete ON "${table}";`);

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

      // Create separate policies for different operations
      console.log(`Creating policies for table ${table}`);
      
      // SELECT policy
      await queryRunner.query(`
        CREATE POLICY ${table}_tenant_select ON "${table}"
        FOR SELECT
        TO public
        USING ("clubId"::TEXT = current_club_id());
      `);

      // INSERT policy
      await queryRunner.query(`
        CREATE POLICY ${table}_tenant_insert ON "${table}"
        FOR INSERT
        TO public
        WITH CHECK ("clubId"::TEXT = current_club_id());
      `);

      // UPDATE policy
      await queryRunner.query(`
        CREATE POLICY ${table}_tenant_update ON "${table}"
        FOR UPDATE
        TO public
        USING ("clubId"::TEXT = current_club_id())
        WITH CHECK ("clubId"::TEXT = current_club_id());
      `);

      // DELETE policy
      await queryRunner.query(`
        CREATE POLICY ${table}_tenant_delete ON "${table}"
        FOR DELETE
        TO public
        USING ("clubId"::TEXT = current_club_id());
      `);

      // Force RLS
      await queryRunner.query(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);

      // Verify the policies
      const policies = await queryRunner.query(`
        SELECT schemaname, tablename, policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = '${table}'
        ORDER BY policyname;
      `);
      console.log(`Detailed policies for ${table}:`, policies);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['event', 'user'];

    for (const table of tables) {
      // First remove all policies
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_isolation ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_select ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_insert ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_update ON "${table}";`);
      await queryRunner.query(`DROP POLICY IF EXISTS ${table}_tenant_delete ON "${table}";`);
      
      // Disable RLS
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
    }

    // Drop the function last
    await queryRunner.query('DROP FUNCTION IF EXISTS current_club_id();');
  }
}
