import {  QueryResult } from 'pg';
import { AppDataSource, initializeDatabase } from '../index';
import config from '../../config';

type MockClient = {
  connect: jest.Mock;
  query: jest.Mock<Promise<QueryResult<any>>>;
  end: jest.Mock;
};

jest.mock('pg', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    end: jest.fn().mockResolvedValue(undefined)
  };

  return {
    Client: jest.fn(() => mockClient)
  };
});

// Mock typeorm DataSource
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      isInitialized: false,
      destroy: jest.fn().mockResolvedValue(undefined)
    }))
  };
});

describe('Database Initialization', () => {
  let mockClient: MockClient;
  let mockExit: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => undefined as never);

    mockClient = new (require('pg').Client)() as MockClient;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createDbIfNotExists', () => {
    it('should create database if it does not exist', async () => {
      const checkDbResult: QueryResult = {
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: [],
      };

      const createDbResult: QueryResult = {
        rows: [],
        rowCount: 1,
        command: 'CREATE',
        oid: 0,
        fields: [],
      };

      mockClient.query
          .mockResolvedValueOnce(checkDbResult)
          .mockResolvedValueOnce(createDbResult);

      await initializeDatabase();

      expect(mockClient.connect).toHaveBeenCalled();

      expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT FROM pg_database WHERE datname = $1',
          [config.POSTGRES_DB]
      );

      expect(mockClient.query).toHaveBeenCalledWith(
          `CREATE DATABASE "${config.POSTGRES_DB}"`
      );

      expect(mockClient.end).toHaveBeenCalled();

      expect(AppDataSource.initialize).toHaveBeenCalled();
    });

    it('should not create database if it already exists', async () => {
      const checkDbResult: QueryResult = {
        rows: [{ datname: config.POSTGRES_DB }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };

      mockClient.query.mockResolvedValueOnce(checkDbResult);

      await initializeDatabase();

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.end).toHaveBeenCalled();
      expect(AppDataSource.initialize).toHaveBeenCalled();

      expect(mockConsoleLog).toHaveBeenCalledWith(
          `Database ${config.POSTGRES_DB} already exists`
      );
    });

    it('should handle database name with special characters', async () => {
      const testConfig = { ...config };
      testConfig.POSTGRES_DB = 'mailer_db';

      const checkDbResult: QueryResult = {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };

      const createDbResult: QueryResult = {
        rows: [],
        rowCount: 1,
        command: 'CREATE',
        oid: 0,
        fields: [],
      };

      mockClient.query
          .mockResolvedValueOnce(checkDbResult)
          .mockResolvedValueOnce(createDbResult);

      await initializeDatabase();

      expect(mockClient.query).toHaveBeenCalledWith(
          'SELECT FROM pg_database WHERE datname = $1',
          [testConfig.POSTGRES_DB]
      );
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      mockClient.connect.mockRejectedValueOnce(error);

      await initializeDatabase();

      expect(mockConsoleError).toHaveBeenCalledWith(
          'Database initialization failed:',
          error
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle query error', async () => {
      const error = new Error('Query failed');
      mockClient.query.mockRejectedValueOnce(error);

      await initializeDatabase();

      expect(mockConsoleError).toHaveBeenCalledWith(
          'Database initialization failed:',
          error
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('SIGINT handler', () => {
    it('should close database connection on SIGINT if initialized', async () => {
      (AppDataSource as any).isInitialized = true;

      process.emit('SIGINT');
      await new Promise(setImmediate)

      expect(AppDataSource.destroy).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('Database connection closed.');
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should not attempt to close connection if not initialized', async () => {
      (AppDataSource as any).isInitialized = false;

      process.emit('SIGINT');

      expect(AppDataSource.destroy).not.toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
});
