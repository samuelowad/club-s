import { DataSource } from 'typeorm';
import { Image } from '../entity/Image';
import config from '../config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.POSTGRES_HOST,
  port: Number(config.POSTGRES_PORT),
  username: config.POSTGRES_USER,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DB,
  synchronize: true,
  entities: [Image],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed', error);
    process.exit(1);
  }
};
