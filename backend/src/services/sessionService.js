import { db } from '../db/client.js';

export const sessionService = {
    async createSession(data) {
        const [session] = await db('sessions')
            .insert({
                provider: data.provider,
                model: data.model,
                title: data.title || 'New conversation',
                is_streaming: data.isStreaming ?? true,
            })
            .returning('*');

        return session;
    },

    async listSessions() {
        const sessions = await db('sessions')
            .select('*')
            .orderBy('updated_at', 'desc');

        return sessions;
    },

    async getSessionById(id) {
        return db('sessions')
            .where({ id })
            .first();
    },

    async updateSession(id, updates) {
        const [session] = await db('sessions')
            .where({ id })
            .update(
                {
                    ...updates,
                    updated_at: db.fn.now(),
                },
                '*'
            );

        return session;
    },

    async deleteSession(id) {
        return db('sessions')
            .where({ id })
            .del();
    },

    async listSessions() {
        const sessions = await db('sessions as s')
            .leftJoin(
                'messages as m',
                's.id',
                'm.session_id'
            )
            .select(
                's.*',
                db.raw('COUNT(m.id)::int as message_count'),
                db.raw(`
        MAX(m.content) as last_message_preview
      `)
            )
            .groupBy('s.id')
            .orderBy('s.updated_at', 'desc');

        return sessions;
    }
};