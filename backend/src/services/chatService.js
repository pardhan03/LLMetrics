import { db } from "../db/client.js";

import { OpenAIProvider } from "../providers/openai.js";
import { AnthropicProvider } from "../providers/anthropic.js";
import { GoogleProvider } from "../providers/google.js";

const providers = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  google: new GoogleProvider(),
};

export class ChatService {
  static async streamChat(sessionId, content) {
    const session = await db("sessions")
      .where({ id: sessionId })
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await db("messages").insert({
      session_id: sessionId,

      role: "user",

      content,
    });

    const messages = await db("messages")
      .where({ session_id: sessionId })
      .orderBy("created_at", "asc");

    const formatted = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const provider = providers[session.provider];

    return {
      provider,
      model: session.model,
      messages: formatted,
    };
  }
}