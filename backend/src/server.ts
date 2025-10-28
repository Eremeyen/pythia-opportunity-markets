import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import priceRoutes from './routes/priceRoutes';
import { connectToDatabase } from './config/db';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/price-points', priceRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Path ${req.path} not found` });
});

authenticateAndStart().catch((error) => {
  console.error('[server] Fatal error during bootstrap', error);
  process.exit(1);
});

async function authenticateAndStart() {
  const port = Number(process.env.PORT) || 4000;
  await connectToDatabase(process.env.MONGO_URI || '');

  app.listen(port, () => {
    console.log(`[server] Listening on port ${port}`);
  });
}

export default app;
