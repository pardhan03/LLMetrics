import { api } from "./client";

export const sendMessage =
  async (sessionId, content) => {
    const { data } = await api.post(
      `/sessions/${sessionId}/chat`,
      {
        content,
      }
    );

    return data;
  };

export const cancelStream =
  async (sessionId) => {
    const { data } = await api.delete(
      `/sessions/${sessionId}/chat/stream`
    );

    return data;
  };