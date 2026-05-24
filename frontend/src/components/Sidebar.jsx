import React from 'react';
import { Plus, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function Sidebar({
  conversations,
  activeId,
  currentView,
  onViewChange,
  onSelectSession,
  onOpenNewChat,
  onDeleteSession
}) {
  return (
    <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 h-full shrink-0">
      <div className="flex flex-col gap-4 overflow-hidden h-full">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-base bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            InferencePulse
          </span>
        </div>

        <button
          onClick={onOpenNewChat}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> New Conversation
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.map((session) => (
            <ConversationItem
              key={session.id}
              conversation={session}
              isActive={activeId === session.id && currentView === 'chat'}
              onClick={() => onSelectSession(session.id)}
              onDelete={onDeleteSession}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3 mt-2 space-y-1 shrink-0">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${currentView === 'dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/40'}`}
        >
          <BarChart3 className="h-4 w-4" /> Dashboard Metrics
        </button>
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${currentView === 'settings' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/40'}`}
        >
          <Settings className="h-4 w-4" /> Global Settings
        </button>
      </div>
    </aside>
  );
}