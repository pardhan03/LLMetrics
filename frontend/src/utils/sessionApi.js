import api from "./api";

export const sessionService = {
  // POST /api/sessions
  create: (payload) => apiClient.post('/sessions', payload),

  // GET /api/sessions
  getAll: () => apiClient.get('/sessions'),

  // GET /api/sessions/:id
  getOne: (id) => apiClient.get(`/sessions/${id}`),

  // PATCH /api/sessions/:id (Handles Rename, Resume, Cancel)
  update: (id, updates) => apiClient.patch(`/sessions/${id}`, updates),

  // DELETE /api/sessions/:id
  delete: (id) => apiClient.delete(`/sessions/${id}`),

  // GET /api/sessions/:id/messages
  getMessages: (id) => apiClient.get(`/sessions/${id}/messages`),
};