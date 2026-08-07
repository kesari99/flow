import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { registerRoutes } from './routes';
import { ALLOWED_ORIGINS } from './constants';
import { customLogger } from './utils/logger';
import { securityHeadersMiddleware } from './middleware/security.middleware';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(securityHeadersMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 5050;

(async () => {
  const server = await registerRoutes(app);
  app.use(errorMiddleware);

  server.listen(PORT, () => {
    customLogger.info(`Promptflow server running on port ${PORT}`);
  });
})();
