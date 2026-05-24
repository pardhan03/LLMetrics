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

            return res.json({
                totalRequests:
                    Number(
                        totalRequests[0].count
                    ),

                errorRate:
                    Number(errors[0].count) /
                    Number(
                        totalRequests[0].count
                    ),

                avgLatency:
                    Number(avgLatency[0].avg),

                totalTokens:
                    Number(
                        totalTokens[0].total
                    ),
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

            return res.json(errors);
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