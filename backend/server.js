import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './src/config/env.js';

import { rateLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import { sessionsRouter } from './src/routes/sessions.js';
import { chatRouter } from './src/routes/chat.js';
import { ingestRouter } from './src/routes/ingest.js';
import { analyticsRouter } from './src/routes/analytics.js';

import './src/workers/logWorker.js';

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  // credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(rateLimiter);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/sessions', chatRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/analytics', analyticsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
