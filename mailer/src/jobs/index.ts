import cron from 'node-cron';
import { mailerJob } from '../services/mailer.service';

export function initializeJobs() {
  cron.schedule('*/10 * * * *', async () => {
    await mailerJob();
  })
}
