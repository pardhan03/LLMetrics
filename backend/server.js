import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './src/config/env.js';

import { rateLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';

import { sessionsRouter } from './src/routes/sessions.js';

import "./src/workers/logWorker.js";

import "./src/workers/piiWorker.js";

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));

app.use(rateLimiter);
app.use(errorHandler);
app.use(helmet());

app.use(express.json({ limit: '1mb' }));

app.use('/api/sessions', sessionsRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});