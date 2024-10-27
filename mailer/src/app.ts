import { connectRabbitMQ } from './consumers/messageConsumer';
import { initializeJobs } from './jobs';
import { AppDataSource } from './database';
import { logger } from './utils/logger';
import express from 'express';
import client from 'prom-client';

const app = express();
const port =process.env.SERVER_PORT || 9100;

const emailJobsCounter = new client.Counter({
  name: 'email_jobs_total',
  help: 'Total number of email jobs processed',
});

const rabbitMQConnectionGauge = new client.Gauge({
  name: 'rabbitmq_connection_status',
  help: 'Status of RabbitMQ connection (1 = connected, 0 = disconnected)',
});

const databaseConnectionGauge = new client.Gauge({
  name: 'database_connection_status',
  help: 'Status of the database connection (1 = connected, 0 = disconnected)',
});

async function initApp() {
  try {
    await AppDataSource.initialize();
    databaseConnectionGauge.set(1);
    logger.info('Database connected.');

    initializeJobs(() => {
      emailJobsCounter.inc();
    });
    console.log('Cron jobs started for email sending.');

    await connectRabbitMQ();
    rabbitMQConnectionGauge.set(1);
  } catch (error) {
    databaseConnectionGauge.set(0);
    rabbitMQConnectionGauge.set(0);
    logger.error('Error initializing app:', error);
  }
}

client.collectDefaultMetrics();

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => {
  console.log(`Metrics server is running on port ${port}`);
});

initApp().catch((error) => logger.error('Error initializing app:', error));
