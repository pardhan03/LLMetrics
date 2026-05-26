import Anthropic from "@anthropic-ai/sdk";

import { env } from "../config/env.js";

import { BaseProvider } from "./base.js";

export class AnthropicProvider extends BaseProvider {
    constructor() {
        super();

        this.client = new Anthropic({
            apiKey: env.ANTHROPIC_API_KEY,
        });
    }

    listModels() {
        return [
            "claude-3-5-sonnet-latest",
            "claude-3-opus-latest",
            "claude-3-haiku-20240307",
        ];
    }

    async chat(messages, model) {
        const start = Date.now();

        const response = await this.client.messages.create({
            model,

            max_tokens: 1024,

            messages,
        });

        const latencyMs = Date.now() - start;

        return {
            content: response.content[0].text,

            promptTokens: response.usage?.input_tokens || 0,

            completionTokens: response.usage?.output_tokens || 0,

            totalTokens:
                (response.usage?.input_tokens || 0) +
                (response.usage?.output_tokens || 0),

            latencyMs,

            model,

            provider: "anthropic",
        };
    }

    async stream(messages, model, onChunk, signal) {
        const start = Date.now();

        let fullContent = "";

        let ttftMs = null;

        const stream = await this.client.messages.stream(
            {
                model,
                max_tokens: 1024,
                messages,
            },
            { signal }
        );

        for await (const event of stream) {
            if (signal?.aborted) break;

            const delta = event.delta?.text || "";

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

            provider: "anthropic",
        };
    }
}