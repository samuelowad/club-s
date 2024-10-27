import cron from 'node-cron';
import { mailerJob } from '../services/mailer.service';
import { initializeJobs } from './index';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('../services/mailer.service', () => ({
  mailerJob: jest.fn(),
}));

describe('Job Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule the mailerJob to run every 10 minutes', () => {
    initializeJobs();

    expect(cron.schedule).toHaveBeenCalledWith('*/10 * * * *', expect.any(Function));
  });

  it('should call mailerJob when the scheduled job runs', async () => {
    initializeJobs();

    const scheduledJob = (cron.schedule as jest.Mock).mock.calls[0][1];

    await scheduledJob();

    expect(mailerJob).toHaveBeenCalled();
  });
});
