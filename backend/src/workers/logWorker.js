import { Worker } from 'bullmq';

import { redis } from '../queue/inferenceQueue.js';
import { db } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { PiiRedactor } from '../sdk/piiRedactor.js';

export const logWorker = new Worker(
    'inference-logs',
    async (job) => {
        const { logId } = job.data;

        logger.info(`Processing log ${logId}`);

        const log = await db('inference_logs')
            .where({ id: logId })
            .first();

        if (!log) {
            throw new Error('Log not found');
        }

        const cleanedInput = PiiRedactor.redact(log.input_preview || '');
        const cleanedOutput = PiiRedactor.redact(log.output_preview || '');

        await db('inference_logs')
            .where({ id: logId })
            .update({
                input_preview: cleanedInput,
                output_preview: cleanedOutput,
            });

        const estimatedCost = AnalyticsService.estimateCost(
            log.provider,
            log.model,
            log.total_tokens
        );

        logger.info({ logId, estimatedCost });

        await AnalyticsService.updateSnapshot(log);

        return { success: true };
    },
    {
        connection: redis,
        concurrency: 5,
    }
);

logWorker.on('completed', (job) => {
    logger.info(`Job completed ${job.id}`);
});

logWorker.on('failed', (job, err) => {
    logger.error({
        jobId: job?.id,
        error: err.message,
    });
});
