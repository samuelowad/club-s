import { DataSource } from 'typeorm';
import config from '../config';
import { User } from './entity/User';
import { Ticket } from './entity/Ticket';
import { Event } from './entity/Event';
import { Client } from 'pg';
import { Seat } from './entity/Seat';
import { UserRole } from '../enum/userRole.enum';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.POSTGRES_HOST,
  port: Number(config.POSTGRES_PORT),
  username: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
  synchronize: true,
  entities: [User, Event, Ticket, Seat],
});

const createDbIfNotExists = async () => {
  const client = new Client({
    host: config.POSTGRES_HOST,
    port: Number(config.POSTGRES_PORT),
    user: config.POSTGRES_USER,
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

const seedDatabase = async () => {
  const userRepository = AppDataSource.getRepository(User);

  const existingUsers = await userRepository.count();
  if (existingUsers === 0) {
    console.log('Seeding database with initial users...');


    const users = [
      {
        email: 'test1234@test.com',
        password: '$2a$10$Rr44lLYBDaEBgRbPp/7OAuB8C2WYYVQ3GBe.GKAZXyEFBUqWydGCK',
        role: UserRole.CUSTOMER,
      },
      {
        email: 'test123@test.com',
        password: '$2a$10$ylybB/NXleTVn.4laUQAQeXhc2J8/yUny/i.zBWvclLzFpEbvoHZu',
        role: UserRole.ADMIN,
      },
    ];

    await userRepository.save(users);
    console.log('Initial users seeded successfully');
  } else {
    console.log('Users already exist in the database; skipping seeding');
  }
};

export const initializeDatabase = async () => {
  try {
    await createDbIfNotExists();

    await AppDataSource.initialize();
    console.log('Database connection initialized successfully');

    await seedDatabase();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
  process.exit(0);
});
