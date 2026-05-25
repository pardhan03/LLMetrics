import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

// Shared Query Key Matrix
export const keys = {
  sessions: ['sessions'],
  messages: (id) => ['messages', id],
  analyticsSummary: ['analytics', 'summary'],
  analyticsErrors: ['analytics', 'errors'],
  logDetail: (id) => ['logs', id],
};

export function usePipelineQueries() {
  const queryClient = useQueryClient();

  // ==========================================
  // SESSIONS APIS (Category 1)
  // ==========================================

  // GET /api/sessions
  const useGetSessions = () => useQuery({
    queryKey: keys.sessions,
    queryFn: async () => {
      const { data } = await api.get('/sessions');
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  // POST /api/sessions
  const useCreateSession = () => useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/sessions', payload);
      return data;
    },
    onSuccess: (newSession) => {
      // Optimistically append the new session entry into the cached sidebar array
      queryClient.setQueryData(keys.sessions, (old = []) => [newSession, ...old]);
    },
  });

  // PATCH /api/sessions/:id
  const useUpdateSession = () => useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.patch(`/sessions/${id}`, updates);
      return data;
    },
    onSuccess: (updatedSession) => {
      // Update the targeted entry across the localized runtime session array cache
      queryClient.setQueryData(keys.sessions, (old = []) =>
        old.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      );
    },
  });

  // DELETE /api/sessions/:id
  const useDeleteSession = () => useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sessions/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Evict deleted thread from sidebar cache instantly
      queryClient.setQueryData(keys.sessions, (old = []) => old.filter((s) => s.id !== deletedId));
      queryClient.removeQueries({ queryKey: keys.messages(deletedId) });
    },
  });

  // ==========================================
  // ANALYTICS APIS (Category 4)
  // ==========================================

  // GET /api/analytics/summary
  const useGetAnalyticsSummary = () => useQuery({
    queryKey: keys.analyticsSummary,
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary');
      return data;
    },
    staleTime: 1000 * 60, // 1 minute fresh window
  });

  // GET /api/analytics/errors
  const useGetAnalyticsErrors = () => useQuery({
    queryKey: keys.analyticsErrors,
    queryFn: async () => {
      const { data } = await api.get('/analytics/errors');
      return data;
    },
    staleTime: 1000 * 30,
  });

  // GET /api/analytics/logs/:id
  const useGetLogDetail = (logId) => useQuery({
    queryKey: keys.logDetail(logId),
    queryFn: async () => {
      const { data } = await api.get(`/analytics/logs/${logId}`);
      return data;
    },
    enabled: !!logId,
    staleTime: 1000 * 60 * 5, // Static data can stay warm longer
  });

  return {
    useGetSessions,
    useCreateSession,
    useUpdateSession,
    useDeleteSession,
    useGetAnalyticsSummary,
    useGetAnalyticsErrors,
    useGetLogDetail,
  };
}