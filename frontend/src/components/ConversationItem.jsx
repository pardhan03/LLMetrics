import React from 'react';

export default function ConversationItem({ conversation, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer group flex flex-col gap-1.5 border transition ${
        isActive
          ? 'bg-slate-800 border-slate-700 shadow-md'
          : 'bg-transparent border-transparent hover:bg-slate-800/40'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-medium text-sm truncate text-slate-200 group-hover:text-white">
          {conversation.title}
        </span>
        <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${conversation.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      </div>
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span className="uppercase text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300">
          {conversation.model}
        </span>
        <span>{conversation.createdAt}</span>
      </div>
    </div>
  );
}