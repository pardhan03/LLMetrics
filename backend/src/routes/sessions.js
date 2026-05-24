import express from 'express';

import { sessionService } from '../services/sessionService.js';
import { messageService } from '../services/messageService.js';

import { validate } from '../middleware/validate.js';

import {
    CreateSessionSchema,
    UpdateSessionSchema,
} from './schemas/sessionSchemas.js';

import { AppError } from '../utils/errors.js';

export const sessionsRouter = express.Router();

sessionsRouter.post(
    '/',
    validate(CreateSessionSchema),
    async (req, res, next) => {
        try {
            const session = await sessionService.createSession(
                req.validated.body
            );

            res.status(201).json(session);
        } catch (error) {
            next(error);
        }
    }
);

sessionsRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const sessions =
                await sessionService.listSessions();

            res.json(sessions);
        } catch (error) {
            next(error);
        }
    }
);

sessionsRouter.get(
    '/:id',
    async (req, res, next) => {
        try {
            const session =
                await sessionService.getSessionById(
                    req.params.id
                );

            if (!session) {
                throw new AppError(
                    'Session not found',
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            res.json(session);
        } catch (error) {
            next(error);
        }
    }
);

sessionsRouter.patch(
    '/:id',
    validate(UpdateSessionSchema),
    async (req, res, next) => {
        try {
            const session =
                await sessionService.updateSession(
                    req.params.id,
                    req.validated.body
                );

            res.json(session);
        } catch (error) {
            next(error);
        }
    }
);

sessionsRouter.delete(
    '/:id',
    async (req, res, next) => {
        try {
            await sessionService.deleteSession(
                req.params.id
            );

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

sessionsRouter.get(
    '/:id/messages',
    async (req, res, next) => {
        try {
            const messages =
                await messageService.getMessagesBySession(
                    req.params.id
                );

            res.json(messages);
        } catch (error) {
            next(error);
        }
    }
);