import express from "express";

import { ChatService } from "../services/chatService.js";

import {
    streamConnections,
    streamControllers,
} from "../services/streamRegistry.js";

import { db } from "../db/client.js";

import { InferenceLogger } from "../sdk/index.js";

export const chatRouter = express.Router();

chatRouter.get("/:id/stream", async (req, res) => {
    const sessionId = req.params.id;

    // SSE HEADERS
    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.flushHeaders();

    // STORE SSE CONNECTION
    streamConnections.set(sessionId, res);

    // CLIENT DISCONNECT
    req.on("close", () => {
        streamConnections.delete(sessionId);

        const controller =
            streamControllers.get(sessionId);

        if (controller) {
            controller.abort();

            streamControllers.delete(sessionId);
        }
    });
});

chatRouter.post(
    "/:id/chat",
    async (req, res, next) => {
        try {
            const sessionId = req.params.id;

            const { content } = req.body;

            // GET ACTIVE SSE CONNECTION
            const connection =
                streamConnections.get(sessionId);

            if (!connection) {
                return res.status(400).json({
                    error:
                        "No SSE connection found",
                });
            }

            const {
                provider,
                model,
                messages,
                session,
            } = await ChatService.streamChat(
                sessionId,
                content
            );

            const controller =
                new AbortController();

            streamControllers.set(
                sessionId,
                controller
            );

            let assistantContent = "";

            InferenceLogger.wrap({
                sessionId,

                provider:
                    session.provider,

                model,

                input: content,

                isStreaming: true,

                fn: async ({
                    onFirstToken,
                }) => {
                    return provider.stream(
                        messages,

                        model,

                        (chunk) => {

                            if (chunk.done) {
                                connection.write(
                                    `data: ${JSON.stringify({
                                        type: "done",
                                    })}\n\n`
                                );

                                return;
                            }

                            onFirstToken();

                            assistantContent +=
                                chunk.delta;


                            connection.write(
                                `data: ${JSON.stringify({
                                    type: "delta",

                                    delta: chunk.delta,
                                })}\n\n`
                            );
                        },

                        controller.signal
                    );
                },
            })
                .then(async (result) => {

                    const [assistantMessage] =
                        await db("messages")
                            .insert({
                                session_id:
                                    sessionId,

                                role: "assistant",

                                content:
                                    assistantContent,
                            })
                            .returning("*");


                    connection.write(
                        `data: ${JSON.stringify({
                            type: "metrics",

                            messageId:
                                assistantMessage.id,

                            latencyMs:
                                result.latencyMs,

                            totalTokens:
                                result.totalTokens,

                            promptTokens:
                                result.promptTokens,

                            completionTokens:
                                result.completionTokens,
                        })}\n\n`
                    );
                })
                .catch((error) => {

                    connection.write(
                        `data: ${JSON.stringify({
                            type: "error",

                            code:
                                error.code ||
                                "STREAM_ERROR",

                            message:
                                error.message,
                        })}\n\n`
                    );
                });


            return res.status(202).json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }
);

/*
========================================
ABORT STREAM
DELETE /api/sessions/:id/chat/stream
========================================
*/

chatRouter.delete(
    "/:id/chat/stream",
    async (req, res) => {
        const sessionId = req.params.id;

        const controller =
            streamControllers.get(sessionId);

        if (controller) {
            controller.abort();

            streamControllers.delete(
                sessionId
            );

            const connection =
                streamConnections.get(sessionId);

            if (connection) {
                connection.write(
                    `data: ${JSON.stringify({
                        type: "cancelled",
                    })}\n\n`
                );
            }
        }

        return res.json({
            success: true,
        });
    }
);