import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ConversationItem({ conversation, isActive, onClick, onDelete }) {
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Stop parent navigation routing selection triggers
    if (confirm('Are you sure you want to permanently delete this inference log session?')) {
      onDelete(conversation.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer group flex flex-col gap-1.5 border transition relative ${isActive
          ? 'bg-slate-800 border-slate-700 shadow-md'
          : 'bg-transparent border-transparent hover:bg-slate-800/40'
        }`}
    >
      <div className="flex justify-between items-start gap-2 pr-6">
        <span className="font-medium text-sm truncate text-slate-200 group-hover:text-white">
          {conversation.title}
        </span>
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${conversation.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      </div>

      {/* Real-time Message Content Preview */}
      <p className="text-xs text-slate-400 truncate line-clamp-1">
        {conversation.last_message_preview || "No messages sent yet."}
      </p>

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
        <span className="uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300">
          {conversation.model}
        </span>
        <div className="flex items-center gap-2">
          <span>{conversation.message_count || 0} msgs</span>
        </div>
      </div>

      {/* Delete Action Trigger Overlay */}
      <button
        onClick={handleDeleteClick}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-0.5 rounded hover:bg-slate-950/40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}