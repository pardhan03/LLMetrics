import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import api, { getStreamUrl } from '../utils/api';

function waitForSseConnection(eventSource) {
  return new Promise((resolve, reject) => {
    if (eventSource.readyState === EventSource.OPEN) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('SSE connection timed out'));
    }, 5000);

    eventSource.onopen = () => {
      clearTimeout(timeout);
      resolve();
    };

    eventSource.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('SSE connection failed'));
    };
  });
}

export function useChatEngine(sessionId) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef(null);
  const sseReadyRef = useRef(null);

  const queryKey = ['messages', sessionId];

  const { data: messages = [], isLoading: isLoadingHistory } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await api.get(`/sessions/${sessionId}/messages`);
      return res.data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });

  const safelyStopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    sseReadyRef.current = null;
    setIsStreaming(false);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      if (sseReadyRef.current) {
        await sseReadyRef.current;
      }
      return api.post(`/sessions/${sessionId}/chat`, { content: text });
    },
    onMutate: async (userPromptText) => {
      safelyStopStream();

      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData(queryKey) || [];

      const userMessageId = crypto.randomUUID();
      const assistantMessageId = crypto.randomUUID();

      const optimisticUserMsg = { id: userMessageId, role: 'user', content: userPromptText };
      const placeholderAssistantMsg = { id: assistantMessageId, role: 'assistant', content: '' };

      queryClient.setQueryData(queryKey, [...previousMessages, optimisticUserMsg, placeholderAssistantMsg]);

      setIsStreaming(true);

      const sseUrl = getStreamUrl(sessionId);
      eventSourceRef.current = new EventSource(sseUrl);

      const es = eventSourceRef.current;

      sseReadyRef.current = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SSE connection timed out'));
        }, 5000);

        es.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        es.onerror = (err) => {
          clearTimeout(timeout);
          reject(err);
        };

        es.onmessage = (event) => {
          const payload = JSON.parse(event.data);

          if (payload.type === 'connected') {
            return;
          }

          if (payload.type === 'delta') {
            queryClient.setQueryData(queryKey, (oldCache) =>
              oldCache?.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                    ...msg,
                    content: msg.content + payload.delta,
                  }
                  : msg
              )
            );
          }

          if (payload.type === 'metrics') {
            queryClient.setQueryData(queryKey, (oldCache) =>
              oldCache?.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                    ...msg,
                    id: payload.messageId || msg.id,
                    log_id: payload.logId,
                    latency_ms: payload.latencyMs,
                    total_tokens: payload.totalTokens,
                  }
                  : msg
              )
            );
          }

          if (payload.type === 'done') {
            safelyStopStream();

            queryClient.invalidateQueries({
              queryKey,
            });

            queryClient.invalidateQueries({
              queryKey: ['sessions'],
            });
          }

          if (payload.type === 'error') {
            safelyStopStream();

            queryClient.setQueryData(queryKey, (oldCache) =>
              oldCache?.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                    ...msg,
                    content:
                      msg.content +
                      `\n[Stream Interrupted: ${payload.message}]`,
                  }
                  : msg
              )
            );
          }

          if (payload.type === 'cancelled') {
            safelyStopStream();

            queryClient.invalidateQueries({
              queryKey,
            });
          }
        };
      });

      return { previousMessages };
    },
    onError: (err, _text, context) => {
      safelyStopStream();
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
    },
  });

  const abortStreamMutation = useMutation({
    mutationFn: async () => {
      safelyStopStream();
      return api.delete(`/sessions/${sessionId}/chat/stream`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    messages,
    isLoadingHistory,
    isStreaming,
    sendMessage: sendMessageMutation.mutate,
    abortStream: abortStreamMutation.mutate,
  };
}
