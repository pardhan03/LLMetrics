import React from 'react';

export default function ModelSelector({ provider, model, onProviderChange, onModelChange }) {
  const modelsByProvider = {
    openai: ['gpt-4o', 'gpt-4-turbo'],
    anthropic: ['claude-3-5-sonnet', 'claude-3-opus'],
    google: ['gemini-1.5-pro', 'gemini-1.5-flash']
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Upstream Provider</label>
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="openai">OpenAI (GPT)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="google">Google (Gemini)</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Foundation Model Core</label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {modelsByProvider[provider]?.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}