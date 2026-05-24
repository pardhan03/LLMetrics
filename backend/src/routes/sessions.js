import express from 'express';

export const sessionsRouter = express.Router();

sessionsRouter.get('/', (req, res) => {
  res.json({
    message: 'Sessions route working',
  });
});