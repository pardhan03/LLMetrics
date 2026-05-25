import React, { useState } from 'react';
import { MessageSquare, Loader2, Square, Send } from 'lucide-react';
import MessageBubble from '../components/MessageBubble';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { useChatEngine } from '../hooks/useChatEngine';

export default function ChatWorkspace({ activeSession, onToggleStatus, onOpenLog }) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [input, setInput] = useState('');

  // Consume your integrated React Query pipeline hook
  const {
    messages,
    isLoadingHistory,
    isStreaming,
    sendMessage,
    abortStream
  } = useChatEngine(activeSession?.id);

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full bg-slate-950">
        <MessageSquare className="h-10 w-10 text-slate-600 mb-2 stroke-[1.5]" />
        <h2 className="text-base font-semibold text-slate-300">Workspace Inactive</h2>
        <p className="text-xs text-slate-500 max-w-xs mt-1">Select an item from the historical pipeline matrix to review.</p>
      </div>
    );
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden bg-slate-950">
      {/* Thread Header Banner */}
      <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/30">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-slate-200">{activeSession.title}</h1>
          <StatusBadge status={activeSession.status} />
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase">
            {activeSession.provider} · {activeSession.model}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isStreaming && (
            <button
              onClick={() => abortStream()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded-lg border border-rose-500/20 transition"
            >
              <Square className="h-3 w-3 fill-current" /> Stop Generation
            </button>
          )}

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
        </div>
      </header>

      {/* Message Feed Container Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
        {isLoadingHistory ? (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-slate-500 pt-12">No messages recorded in this routing segment.</div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} message={msg} onOpenLog={onOpenLog} />
          ))
        )}
      </div>

      {/* Input Dock */}
      <footer className="p-4 bg-slate-900/10 border-t border-slate-800">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={activeSession.status === 'cancelled' || isStreaming}
            type="text"
            placeholder={
              activeSession.status === 'cancelled' 
                ? "This route trace is frozen. Click resume above..." 
                : "Enter query instruction sequence..."
            }
            className="bg-transparent flex-1 focus:outline-none text-xs text-slate-200 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={activeSession.status === 'cancelled' || !input.trim() || isStreaming}
            className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg hover:bg-emerald-600 disabled:opacity-30 transition"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </footer>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title={activeSession.status === 'active' ? "Terminate Generation Pipeline Thread?" : "Re-activate Conversation context?"}
        body="Modifying this state will alter operational behavior metrics."
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