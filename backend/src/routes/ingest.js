import express from "express";

import { z } from "zod";

import { IngestService } from "../services/ingestService.js";
import { inferenceQueue } from "../queue/inferenceQueue.js";

export const ingestRouter = express.Router();

const InferenceLogSchema = z.object({
    id: z.string(),
    sessionId: z.string(),
    provider: z.string(),
    model: z.string(),
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
    latencyMs: z.number(),
    ttftMs: z.number().nullable(),
    status: z.enum([
        "success",
        "error",
        "cancelled",
    ]),
    errorCode: z.string().optional(),
    errorMessage: z.string().optional(),
    inputPreview: z.string(),
    outputPreview: z.string(),
    isStreaming: z.boolean(),
    createdAt: z.string(),
});

const BatchSchema = z.object({
    logs: z.array(InferenceLogSchema),
});

ingestRouter.post(
    "/logs",
    async (req, res, next) => {
        try {
            const validated =
                BatchSchema.parse(req.body);

            await IngestService.storeLogs(
                validated.logs
            );
            for (const log of validated.logs) {
                await inferenceQueue.add(
                    "log.created",
                    {
                        logId: log.id,
                    },
                    {
                        attempts: 3,

                        backoff: {
                            type: "exponential",

                            delay: 1000,
                        },
                        removeOnComplete: true,
                        removeOnFail: false,
                    }
                );
            }

            return res.status(202).json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }
);