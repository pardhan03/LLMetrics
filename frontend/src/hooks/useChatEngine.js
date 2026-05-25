import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import api from '../utils/api';

export function useChatEngine(sessionId) {
    const queryClient = useQueryClient();
    const [isStreaming, setIsStreaming] = useState(false);
    const eventSourceRef = useRef(null);

    const queryKey = ['messages', sessionId];

    // 1. Fetch Chat History via React Query
    const { data: messages = [], isLoading: isLoadingHistory } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!sessionId) return [];
            const res = await api.get(`/sessions/${sessionId}/messages`);
            return res.data; // Stripped via interceptor or unwrap
        },
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 5, // Keep cached messages fresh for 5 mins
    });

    // Clean stream teardown function
    const safelyStopStream = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsStreaming(false);
    };

    // 2. Transmit Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (text) => {
            return api.post(`/sessions/${sessionId}/chat`, { content: text });
        },
        onMutate: async (userPromptText) => {
            safelyStopStream();

            // Cancel outbound refetches so they don't overwrite our stream injection
            await queryClient.cancelQueries({ queryKey });

            // Snapshot old cache state for safety rollback configurations
            const previousMessages = queryClient.getQueryData(queryKey) || [];

            // Create local temporary IDs
            const userMessageId = crypto.randomUUID();
            const assistantMessageId = crypto.randomUUID();

            const optimisticUserMsg = { id: userMessageId, role: 'user', content: userPromptText };
            const placeholderAssistantMsg = { id: assistantMessageId, role: 'assistant', content: '' };

            // Optimistically push both user prompt & assistant placeholder directly into the React Query cache
            queryClient.setQueryData(queryKey, [...previousMessages, optimisticUserMsg, placeholderAssistantMsg]);

            setIsStreaming(true);

            // Initialize SSE client stream capture
            const sseUrl = `http://localhost:4000/api/sessions/${sessionId}/stream`;
            eventSourceRef.current = new EventSource(sseUrl);

            eventSourceRef.current.onmessage = (event) => {
                const payload = JSON.parse(event.data);

                if (payload.type === 'delta') {
                    // Incrementally update the exact assistant placeholder message inside React Query's cache
                    queryClient.setQueryData(queryKey, (oldCache) =>
                        oldCache?.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: msg.content + payload.delta }
                                : msg
                        )
                    );
                }

                if (payload.type === 'done') {
                    safelyStopStream();
                    // Invalidate cache to sync perfectly with true server IDs & timestamps
                    queryClient.invalidateQueries({ queryKey });
                    queryClient.invalidateQueries({ queryKey: ['sessions'] }); // Update sidebar preview text
                }

                if (payload.type === 'error') {
                    safelyStopStream();
                    queryClient.setQueryData(queryKey, (oldCache) =>
                        oldCache?.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: msg.content + `\n[Stream Interrupted: ${payload.message}]` }
                                : msg
                        )
                    );
                }
            };

            eventSourceRef.current.onerror = () => {
                safelyStopStream();
            };

            return { previousMessages };
        },
        onError: (err, newTodo, context) => {
            safelyStopStream();
            // Rollback memory states if initial mutation request pipeline breaks completely
            if (context?.previousMessages) {
                queryClient.setQueryData(queryKey, context.previousMessages);
            }
        }
    });

    // 3. Stop Stream Mutation Handler (DELETE /api/sessions/:id/chat/stream)
    const abortStreamMutation = useMutation({
        mutationFn: async () => {
            safelyStopStream();
            return api.delete(`/sessions/${sessionId}/chat/stream`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    return {
        messages,
        isLoadingHistory,
        isStreaming,
        sendMessage: sendMessageMutation.mutate,
        abortStream: abortStreamMutation.mutate,
    };
}