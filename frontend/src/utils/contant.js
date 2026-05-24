export const mockConversations = [
  { id: '1', title: 'Optimizing Docker Compose Profiles', provider: 'openai', model: 'gpt-4o', status: 'active', createdAt: '2 min ago' },
  { id: '2', title: 'Regex Masking Rules for SSN PII', provider: 'anthropic', model: 'claude-3-5-sonnet', status: 'cancelled', createdAt: 'Yesterday' }
];

export const mockMessages = {
  '1': [
    { id: 'm1', role: 'user', content: 'How do I use extension fields in Docker Compose v2?', createdAt: '11:40 AM' },
    { id: 'm2', role: 'assistant', content: 'You can use YAML anchors (`&`) and aliases (`*`), or the native `x-` extension fields to reduce configuration duplication.', createdAt: '11:41 AM', latencyMs: 840, tokensTotal: 142, logId: 'log-001' }
  ],
  '2': [
    { id: 'm3', role: 'user', content: 'Write a robust regex for catching global SSN numbers.', createdAt: 'Yesterday' },
    { id: 'm4', role: 'assistant', content: 'This conversation thread was marked cancelled by the system operator.', createdAt: 'Yesterday', latencyMs: 120, tokensTotal: 15, logId: 'log-002' }
  ]
};

export const mockLogDetails = {
  'log-001': {
    id: 'log-001',
    sessionId: '1',
    messageId: 'm2',
    provider: 'openai',
    model: 'gpt-4o',
    latencyMs: 840,
    ttftMs: 180,
    promptTokens: 42,
    completionTokens: 100,
    status: 'success',
    inputPreview: 'How do I use extension fields in Docker Compose v2?',
    outputPreview: 'You can use YAML anchors (&) and aliases (*), or the native x- extension fields...'
  }
};