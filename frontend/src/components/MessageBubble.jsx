import React from 'react';

export default function MessageBubble({ message, onOpenLog }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex flex-col max-w-[75%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isUser
          ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
          : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
        }`}>
        {message.content}
      </div>
      {!isUser && message.logId && (
        <div className="flex gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
          <button
            onClick={() => onOpenLog(message.logId)}
            className="hover:text-emerald-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 transition"
          >
            Latency: {message.latencyMs}ms
          </button>
          <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
            Tokens: {message.tokensTotal}
          </span>
        </div>
      )}
    </div>
  );
}