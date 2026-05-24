import { db } from "../db/client.js";

export class IngestService {
    static async storeLogs(logs) {
        return db("inference_logs").insert(
            logs.map((log) => ({
                id: log.id,
                session_id: log.sessionId,
                provider: log.provider,
                model: log.model,
                prompt_tokens:
                    log.promptTokens,
                completion_tokens:
                    log.completionTokens,
                total_tokens:
                    log.totalTokens,
                latency_ms:
                    log.latencyMs,
                ttft_ms:
                    log.ttftMs,
                status: log.status,
                error_code:
                    log.errorCode,
                error_message:
                    log.errorMessage,
                input_preview:
                    log.inputPreview,
                output_preview:
                    log.outputPreview,
                is_streaming:
                    log.isStreaming,
                created_at:
                    log.createdAt,
            }))
        );
    }
}