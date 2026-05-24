import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import MessageBubble from '../components/MessageBubble';
import ConfirmModal from '../components/ConfirmModal';
import StatusBadge from '../components/StatusBadge';

export default function ChatWorkspace({ activeSession, messages, onToggleStatus, onOpenLog }) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <MessageSquare className="h-10 w-10 text-slate-600 mb-2 stroke-[1.5]" />
        <h2 className="text-base font-semibold text-slate-300">Workspace Inactive</h2>
        <p className="text-xs text-slate-500 max-w-xs mt-1">Select an item from the historical pipeline matrix to review.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/30">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-slate-200">{activeSession.title}</h1>
          <StatusBadge status={activeSession.status} />
        </div>
        <button
          onClick={() => setIsCancelModalOpen(true)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
            activeSession.status === 'active'
              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {activeSession.status === 'active' ? 'Halt Session' : 'Resume Stream'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onOpenLog={onOpenLog} />
        ))}
      </div>

      <footer className="p-4 bg-slate-900/10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <input
            disabled={activeSession.status === 'cancelled'}
            type="text"
            placeholder={activeSession.status === 'cancelled' ? "This route trace is frozen. Click resume above..." : "Send query..."}
            className="bg-transparent flex-1 focus:outline-none text-xs text-slate-200 disabled:opacity-40"
          />
          <button 
            disabled={activeSession.status === 'cancelled'}
            className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-600 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </footer>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title={activeSession.status === 'active' ? "Terminate Generation Pipeline Thread?" : "Re-activate Conversation context?"}
        body="This structural state change modifies standard execution sequences and affects metrics."
        confirmLabel={activeSession.status === 'active' ? "Confirm Halt" : "Confirm Open"}
        onCancel={() => setIsCancelModalOpen(false)}
        onConfirm={() => {
          onToggleStatus();
          setIsCancelModalOpen(false);
        }}
      />
    </div>
  );
}