import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ChatWorkspace from './views/ChatWorkspace'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'
import LogDrawer from './components/LogDrawer'
import ModelSelector from './components/ModelSelector'
import { mockConversations, mockMessages } from './utils/contant'

function App() {
  const[currentView, setCurrentView] = useState('chat');
  const [conversations, setConversations] = useState(mockConversations);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  // Modal Configuration Hooks
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');

  const handleCreateSession = () => {
    const nextId = String(conversations.length + 1);
    const newSession = {
      id: nextId,
      title: `Telemetry Thread Trace #${nextId}`,
      provider,
      model,
      status: 'active',
      createdAt: 'Just now'
    };
    setConversations([newSession, ...conversations]);
    setActiveId(nextId);
    setIsModalOpen(false);
    setCurrentView('chat');
  };

  const handleToggleStatus = () => {
    setConversations(conversations.map(c =>
      c.id === activeId
        ? { ...c, status: c.status === 'active' ? 'cancelled' : 'active' }
        : c
    ));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSelectSession={(id) => { setActiveId(id); setCurrentView('chat'); }}
        onOpenNewChat={() => setIsModalOpen(true)}
      />

      <main className="flex-1 h-full relative overflow-hidden bg-slate-950">
        {currentView === 'chat' && (
          <ChatWorkspace
            activeSession={conversations.find(c => c.id === activeId)}
            messages={activeId ? mockMessages[activeId] || [] : []}
            onToggleStatus={handleToggleStatus}
            onOpenLog={setSelectedLogId}
          />
        )}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'settings' && <Settings />}

        <LogDrawer logId={selectedLogId} onClose={() => setSelectedLogId(null)} />

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-bold text-slate-100 mb-4">Provision Telemetry Stream Context</h3>
              <ModelSelector
                provider={provider}
                model={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
              />
              <div className="flex gap-2 justify-end pt-5">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
                  Cancel
                </button>
                <button onClick={handleCreateSession} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition">
                  Initialize Pipe
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
