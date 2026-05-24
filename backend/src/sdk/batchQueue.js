import { env } from "../config/env.js";

export class BatchQueue {
    constructor(sender) {
        this.sender = sender;

        this.queue = [];

        this.batchSize = Number(
            env.LOG_BATCH_SIZE
        );

        this.flushInterval = Number(
            env.LOG_FLUSH_INTERVAL_MS
        );

        this.startTimer();

        process.on("SIGTERM", async () => {
            await this.flush();
        });
    }

    startTimer() {
        setInterval(async () => {
            if (this.queue.length > 0) {
                await this.flush();
            }
        }, this.flushInterval);
    }

    async add(log) {
        this.queue.push(log);

        if (this.queue.length >= this.batchSize) {
            await this.flush();
        }
    }

    async flush() {
        if (this.queue.length === 0) return;

        const batch = [...this.queue];

        this.queue = [];

        await this.sender.send(batch);
    }
}