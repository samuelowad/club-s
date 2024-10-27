import { logger } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log an info message with the correct format', () => {
    const message = 'This is an info message';
    logger.info(message);

    expect(console.log).toHaveBeenCalledWith(`INFO: ${message}`);
  });

  it('should log an error message with the correct format', () => {
    const message = 'This is an error message';
    const error = new Error('This is an error');
    logger.error(message, error);

    expect(console.error).toHaveBeenCalledWith(`ERROR: ${message}`, error);
  });
});
