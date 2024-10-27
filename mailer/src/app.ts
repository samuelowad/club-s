import { connectRabbitMQ } from './consumers/messageConsumer';
import { initializeJobs } from './jobs';
import { AppDataSource } from './database';
import { logger } from './utils/logger';

async function initApp() {
  await AppDataSource.initialize();
  logger.info('Database connected.');

  initializeJobs();
  console.log('Cron jobs started for email sending.');

  await connectRabbitMQ();
}

initApp().catch((error) => logger.error('Error initializing app:', error));
