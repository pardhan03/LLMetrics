import { Worker } from "bullmq";
import { redis } from "../queue/inferenceQueue.js";
import { db } from "../db/client.js";
import { PiiRedactor } from "../sdk/piiRedactor.js";
import { logger } from "../utils/logger.js";

export const piiWorker =
  new Worker(
    "inference-logs",

    async (job) => {
      const { logId } = job.data;

      const log = await db(
        "inference_logs"
      )
        .where({ id: logId })
        .first();

      if (!log) return;

      const cleanedInput =
        PiiRedactor.redact(
          log.input_preview || ""
        );

      const cleanedOutput =
        PiiRedactor.redact(
          log.output_preview || ""
        );

      await db("inference_logs")
        .where({ id: logId })
        .update({
          input_preview:
            cleanedInput,

          output_preview:
            cleanedOutput,
        });

      logger.info(
        `PII scan complete ${logId}`
      );
    },

    {
      connection: redis,
      concurrency: 5,
    }
  );