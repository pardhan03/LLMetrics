import { v4 as uuid } from "uuid";

import { PiiRedactor } from "./piiRedactor.js";
import { BatchQueue } from "./batchQueue.js";
import { HttpSender } from "./httpSender.js";

const sender = new HttpSender(
    "http://localhost:4000/api/ingest/logs"
);

const queue = new BatchQueue(sender);

export class InferenceLogger {
    static async wrap({
        sessionId,
        provider,
        model,
        input,
        isStreaming = false,
        fn,
    }) {
        const start = Date.now();

        let ttftMs = null;

        try {
            const result = await fn({
                onFirstToken: () => {
                    if (!ttftMs) {
                        ttftMs =
                            Date.now() - start;
                    }
                },
            });

            const latencyMs =
                Date.now() - start;

            const log = {
                id: uuid(),
                sessionId,
                provider,
                model,
                promptTokens:
                    result.promptTokens || 0,

                completionTokens:
                    result.completionTokens || 0,

                totalTokens:
                    result.totalTokens || 0,
                latencyMs,
                ttftMs,
                status: "success",
                inputPreview:
                    PiiRedactor.preview(input),
                outputPreview:
                    PiiRedactor.preview(
                        result.content
                    ),
                isStreaming,
                createdAt: new Date().toISOString(),
            };

            await queue.add(log);

            return { ...result, logId: log.id };
        } catch (error) {
            const latencyMs =
                Date.now() - start;

            const log = {
                id: uuid(),
                sessionId,
                provider,
                model,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                latencyMs,
                ttftMs,
                status: "error",
                errorCode:
                    error.code || "UNKNOWN_ERROR",
                errorMessage: error.message,
                inputPreview:
                    PiiRedactor.preview(input),
                outputPreview: "",
                isStreaming,
                createdAt: new Date().toISOString(),
            };

            await queue.add(log);
            throw error;
        }
    }
}