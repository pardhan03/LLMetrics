import OpenAI from "openai";

import { env } from "../config/env.js";

import { BaseProvider } from "./base.js";

export class OpenAIProvider extends BaseProvider {
    constructor() {
        super();

        this.client = new OpenAI({
            apiKey: env.OPENAI_API_KEY,
        });
    }

    listModels() {
        return ["gpt-4.1", "gpt-4o"];
    }

    async chat(messages, model) {
        const start = Date.now();

        const response = await this.client.chat.completions.create({
            model,
            messages,
        });

        const latencyMs = Date.now() - start;

        return {
            content: response.choices[0].message.content,

            promptTokens: response.usage?.prompt_tokens || 0,

            completionTokens: response.usage?.completion_tokens || 0,

            totalTokens: response.usage?.total_tokens || 0,

            latencyMs,

            model,

            provider: "openai",
        };
    }

    async stream(messages, model, onChunk, signal) {
        const start = Date.now();

        let fullContent = "";

        let ttftMs = null;

        const stream = await this.client.chat.completions.create({
            model,
            messages,
            stream: true,
            signal,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content || "";

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

            provider: "openai",
        };
    }
}