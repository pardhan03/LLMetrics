import { db } from "../db/client.js";

export class AnalyticsService {
    /*
    ========================================
    CALCULATE P95 LATENCY
    ========================================
    */

    static calculateP95(values) {
        if (!values.length) return 0;

        const sorted = values.sort(
            (a, b) => a - b
        );

        const index = Math.floor(
            0.95 * sorted.length
        );

        return sorted[index];
    }

    /*
    ========================================
    ESTIMATE TOKEN COST
    ========================================
    */

    static estimateCost(
        provider,
        model,
        totalTokens
    ) {
        const pricing = {
            openai: 0.00001,

            anthropic: 0.000008,

            google: 0.000005,
        };

        const rate =
            pricing[provider] || 0;

        return totalTokens * rate;
    }

    /*
    ========================================
    UPDATE SNAPSHOT
    ========================================
    */

    static async updateSnapshot(log) {
        const now = new Date();

        /*
        ========================================
        HOURLY WINDOW
        ========================================
        */

        const windowStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours()
        );

        const windowEnd = new Date(
            windowStart.getTime() +
            60 * 60 * 1000
        );

        /*
        ========================================
        GET ALL LOGS IN WINDOW
        ========================================
        */

        const logs = await db(
            "inference_logs"
        )
            .whereBetween("created_at", [
                windowStart,
                windowEnd,
            ])
            .andWhere({
                provider: log.provider,

                model: log.model,
            });

        /*
        ========================================
        AGGREGATIONS
        ========================================
        */

        const totalRequests =
            logs.length;

        const errorCount =
            logs.filter(
                (l) => l.status === "error"
            ).length;

        const avgLatencyMs =
            logs.reduce(
                (sum, l) =>
                    sum + l.latency_ms,
                0
            ) / (logs.length || 1);

        const p95LatencyMs =
            this.calculateP95(
                logs.map(
                    (l) => l.latency_ms
                )
            );

        const totalTokens =
            logs.reduce(
                (sum, l) =>
                    sum +
                    (l.total_tokens || 0),
                0
            );

        /*
        ========================================
        UPSERT SNAPSHOT
        ========================================
        */

        const existing =
            await db(
                "analytics_snapshots"
            )
                .where({
                    window_start: windowStart,

                    provider: log.provider,

                    model: log.model,
                })
                .first();

        if (existing) {
            await db(
                "analytics_snapshots"
            )
                .where({
                    id: existing.id,
                })
                .update({
                    total_requests:
                        totalRequests,

                    error_count:
                        errorCount,

                    avg_latency_ms:
                        avgLatencyMs,

                    p95_latency_ms:
                        p95LatencyMs,

                    total_tokens:
                        totalTokens,
                });

            return;
        }

        await db(
            "analytics_snapshots"
        ).insert({
            window_start: windowStart,

            window_end: windowEnd,

            provider: log.provider,

            model: log.model,

            total_requests:
                totalRequests,

            error_count:
                errorCount,

            avg_latency_ms:
                avgLatencyMs,

            p95_latency_ms:
                p95LatencyMs,

            total_tokens:
                totalTokens,
        });
    }
}