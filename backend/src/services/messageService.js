import { db } from '../db/client.js';

export const messageService = {
    async createMessage(data) {
        const [message] = await db('messages')
            .insert(data)
            .returning('*');

        return message;
    },

    async getMessagesBySession(sessionId) {
        const messages = await db('messages')
            .where({ session_id: sessionId })
            .orderBy('created_at', 'asc');

        const logs = await db('inference_logs')
            .where({ session_id: sessionId })
            .where({ status: 'success' })
            .orderBy('created_at', 'asc');

        let logIndex = 0;

        return messages.map((message) => {
            if (message.role !== 'assistant' || !logs[logIndex]) {
                return message;
            }

            const log = logs[logIndex++];

            return {
                ...message,
                log_id: log.id,
                latency_ms: log.latency_ms,
                total_tokens: log.total_tokens,
            };
        });
    },
};
