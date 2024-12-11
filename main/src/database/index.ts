import { DataSource } from 'typeorm';
import config from '../config';
import { User } from './entity/User';
import { Ticket } from './entity/Ticket';
import { Event } from './entity/Event';
import { Client } from 'pg';
import { Seat } from './entity/Seat';
import { UserRole } from '../enum/userRole.enum';
import {Club} from "./entity/Club";

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.POSTGRES_HOST,
  port: Number(config.POSTGRES_PORT),
  username: config.POSTGRES_USER, // Using non-root user for normal operations
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
  synchronize: false,
  entities: [User, Event, Ticket, Seat, Club],
  migrations: ['src/database/migrations/*.ts'],
});

const createDbIfNotExists = async () => {
  const client = new Client({
    host: config.POSTGRES_HOST,
    port: Number(config.POSTGRES_PORT),
    user: config.POSTGRES_USER, // Using superuser for database creation
    password: config.POSTGRES_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();

    const checkDb = await client.query(
        `SELECT FROM pg_database WHERE datname = $1`,
        [config.POSTGRES_DB]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Database ${config.POSTGRES_DB} not found, creating...`);
      const escapedDbName = config.POSTGRES_DB.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${escapedDbName}"`);
      console.log(`Database ${config.POSTGRES_DB} created successfully`);
    } else {
      console.log(`Database ${config.POSTGRES_DB} already exists`);
    }

  } catch (error) {
    console.error('Error during database check/creation:', error);
    throw error;
  } finally {
    await client.end();
  }
};

const createNonRootUser = async () => {
  const client = new Client({
    host: config.POSTGRES_HOST,
    port: Number(config.POSTGRES_PORT),
    user: config.POSTGRES_USER, // Using superuser for user creation
    password: config.POSTGRES_PASSWORD,
    database: config.POSTGRES_DB,
  });

  try {
    await client.connect();
    
    // Check if non-root user exists
    const checkUser = await client.query(
      `SELECT FROM pg_roles WHERE rolname = $1`,
      [config.POSTGRESS_NON_ROOT_USER]
    );

    if (checkUser.rowCount === 0) {
      console.log(`Creating ${config.POSTGRESS_NON_ROOT_USER} role...`);
      
      // Create non-root user
      await client.query(`
        CREATE ROLE ${config.POSTGRESS_NON_ROOT_USER} WITH LOGIN PASSWORD '${config.POSTGRES_PASSWORD}';
        ALTER ROLE ${config.POSTGRESS_NON_ROOT_USER} NOSUPERUSER;
      `);

      // Grant necessary privileges
      await client.query(`
        -- Database connection
        GRANT CONNECT ON DATABASE "${config.POSTGRES_DB}" TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Schema usage
        GRANT USAGE ON SCHEMA public TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Table permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Sequence permissions (needed for auto-incrementing IDs)
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Default privileges for future tables
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Default privileges for future sequences
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO ${config.POSTGRESS_NON_ROOT_USER};
      `);

      console.log(`${config.POSTGRESS_NON_ROOT_USER} created and privileges granted successfully`);
    } else {
      console.log(`${config.POSTGRESS_NON_ROOT_USER} already exists, ensuring privileges...`);
      
      // Ensure privileges are set correctly even if user exists
      await client.query(`
        -- Database connection
        GRANT CONNECT ON DATABASE "${config.POSTGRES_DB}" TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Schema usage
        GRANT USAGE ON SCHEMA public TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Table permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Sequence permissions
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Default privileges for future tables
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${config.POSTGRESS_NON_ROOT_USER};
        
        -- Default privileges for future sequences
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO ${config.POSTGRESS_NON_ROOT_USER};
      `);
      
      console.log('Privileges updated successfully');
    }
  } catch (error) {
    console.error('Error creating/updating non-root user:', error);
    throw error;
  } finally {
    await client.end();
  }
};

const seedDatabase = async () => {
    await createClubs();
    await createUsers();
};

export const initializeDatabase = async () => {
  try {
    await createDbIfNotExists();
    await createNonRootUser();
    await AppDataSource.initialize();
    await seedDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

process.on('SIGINT', async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
  process.exit(0);
});

const createUsers = async () => {
  const userRepository = AppDataSource.getRepository(User);

  const existingUsers = await userRepository.count();
  if (existingUsers === 0) {
    console.log('Seeding database with initial users...');


    const users = [
      {
        email: 'test1234@test.com',
        password: '$2a$10$Rr44lLYBDaEBgRbPp/7OAuB8C2WYYVQ3GBe.GKAZXyEFBUqWydGCK',
        role: UserRole.CUSTOMER,
        clubId: 1,
      },
      {
        email: 'test123@test.com',
        password: '$2a$10$ylybB/NXleTVn.4laUQAQeXhc2J8/yUny/i.zBWvclLzFpEbvoHZu',
        role: UserRole.ADMIN,
        clubId: 2,
      },
    ];

    await userRepository.save(users);
    console.log('Initial users seeded successfully');
  } else {
    console.log('Users already exist in the database; skipping seeding');
  }
}

const createClubs = async () => {
    const clubRepository = AppDataSource.getRepository(Club);

    const existingClubs = await clubRepository.count();
    if (existingClubs === 0) {
        console.log('Seeding database with initial clubs...');

        const clubs = [
        {
            name: 'club1',
        },
        {
            name: 'club2',
        },
        ];

        await clubRepository.save(clubs);
        console.log('Initial clubs seeded successfully');
    } else {
        console.log('Clubs already exist in the database; skipping seeding');
    }
}