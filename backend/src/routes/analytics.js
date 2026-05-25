import express from "express";

import { db } from "../db/client.js";

export const analyticsRouter =
    express.Router();

analyticsRouter.get(
    "/summary",
    async (req, res, next) => {
        try {
            const totalRequests =
                await db(
                    "inference_logs"
                ).count("* as count");

            const errors = await db(
                "inference_logs"
            )
                .where({
                    status: "error",
                })
                .count("* as count");

            const avgLatency =
                await db(
                    "inference_logs"
                ).avg(
                    "latency_ms as avg"
                );

            const totalTokens =
                await db(
                    "inference_logs"
                ).sum(
                    "total_tokens as total"
                );

            const requestCount = Number(totalRequests[0].count);
            const errorCount = Number(errors[0].count);

            return res.json({
                total_requests: requestCount,
                error_count: errorCount,
                error_rate: requestCount > 0 ? errorCount / requestCount : 0,
                avg_latency_ms: Number(avgLatency[0].avg) || 0,
                total_tokens: Number(totalTokens[0].total) || 0,
            });
        } catch (error) {
            next(error);
        }
    }
);

analyticsRouter.get(
    "/latency",
    async (req, res, next) => {
        try {
            const data = await db(
                "analytics_snapshots"
            )
                .select(
                    "window_start",
                    "avg_latency_ms",
                    "p95_latency_ms"
                )
                .orderBy(
                    "window_start",
                    "asc"
                );

            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

analyticsRouter.get(
    "/throughput",
    async (req, res, next) => {
        try {
            const data = await db(
                "analytics_snapshots"
            )
                .select(
                    "window_start",
                    "provider",
                    "total_requests"
                )
                .orderBy(
                    "window_start",
                    "asc"
                );

            return res.json(data);
        } catch (error) {
            next(error);
        }
    }
);

analyticsRouter.get(
    "/errors",
    async (req, res, next) => {
        try {
            const errors = await db(
                "inference_logs"
            )
                .where({
                    status: "error",
                })
                .orderBy(
                    "created_at",
                    "desc"
                )
                .limit(10);

            return res.json({ recent_errors: errors });
        } catch (error) {
            next(error);
        }
    }
);

analyticsRouter.get(
    "/logs/:id",
    async (req, res, next) => {
        try {
            const log = await db(
                "inference_logs"
            )
                .where({
                    id: req.params.id,
                })
                .first();

            return res.json(log);
        } catch (error) {
            next(error);
        }
    }
);