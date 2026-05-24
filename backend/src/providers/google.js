import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "../config/env.js";

import { BaseProvider } from "./base.js";

export class GoogleProvider extends BaseProvider {
    constructor() {
        super();

        this.client = new GoogleGenerativeAI(
            env.GOOGLE_API_KEY
        );
    }

    listModels() {
        return [
            "gemini-1.5-pro",
            "gemini-1.5-flash",
        ];
    }

    async chat(messages, model) {
        const start = Date.now();

        const geminiModel = this.client.getGenerativeModel({
            model,
        });

        const prompt = messages
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n");

        const result = await geminiModel.generateContent(prompt);

        const response = result.response;

        const latencyMs = Date.now() - start;

        return {
            content: response.text(),

            promptTokens: 0,

            completionTokens: 0,

            totalTokens: 0,

            latencyMs,

            model,

            provider: "google",
        };
    }

    async stream(messages, model, onChunk, signal) {
        const start = Date.now();

        let fullContent = "";

        let ttftMs = null;

        const geminiModel = this.client.getGenerativeModel({
            model,
        });

        const prompt = messages
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n");

        const result =
            await geminiModel.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            if (signal?.aborted) break;

            const delta = chunk.text();

            if (!delta) continue;

            if (!ttftMs) {
                ttftMs = Date.now() - start;
            }

            fullContent += delta;

            onChunk({
                delta,
                done: false,
            });
        }

        const latencyMs = Date.now() - start;

        onChunk({
            delta: "",
            done: true,
        });

        return {
            content: fullContent,

            promptTokens: 0,

            completionTokens: 0,

            totalTokens: 0,

            latencyMs,

            ttftMs,

            model,

            provider: "google",
        };
    }
}