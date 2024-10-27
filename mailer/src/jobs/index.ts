import cron from 'node-cron';
import { mailerJob } from '../services/mailer.service';

export function initializeJobs(p0: () => void) {
  cron.schedule('* * * * *', async () => {
    await mailerJob();
  })
}
