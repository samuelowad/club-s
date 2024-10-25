import express from 'express';
import cors from 'cors';
import { initializeDatabase, AppDataSource } from './database';
import routes from './routes/index.routes';
import { errorHandler } from './routes/middleware';
import { logger } from './utils/logger';
import * as http from 'http';

export const app = express();
let server: http.Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(routes);
app.use(logger);
app.use(errorHandler);

const shutdownGracefully = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  const forceShutdown = setTimeout(() => {
    console.error('Force shutting down due to timeout...');
    process.exit(1);
  }, 30000); // 30 seconds timeout

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('HTTP server closed');
          resolve();
        });
      });
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connections closed');
    }

    clearTimeout(forceShutdown);

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  return shutdownGracefully('Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  return shutdownGracefully('Unhandled Rejection');
});

const startServer = async () => {
  try {
    await initializeDatabase();

    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
