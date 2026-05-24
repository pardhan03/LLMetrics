import { db } from "../db/client.js";

export const messageService = {
    async createMessage(data) {
        const [message] = await db('messages')
            .insert(data)
            .returning('*');

        return message;
    },

    async getMessagesBySession(sessionId) {
        return db('messages')
            .where({
                session_id: sessionId,
            })
            .orderBy('created_at', 'asc');
    },
};