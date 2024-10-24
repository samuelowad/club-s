import express from 'express';
import { initializeDatabase } from './database';
import routes from './routes/routes';
import { errorHandler } from './routes/middleware';

export const app = express();

app.use(express.json());

app.use(routes);

app.use(errorHandler);

initializeDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
