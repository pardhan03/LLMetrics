import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatWorkspace from './views/ChatWorkspace';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
import LogDrawer from './components/LogDrawer';
import ModelSelector from './components/ModelSelector';
import { usePipelineQueries } from './hooks/usePipelineQueries';

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  const [provider, setProvider] = useState('google');
  const [model, setModel] = useState('gemini-2.5-flash');

  useEffect(() => {
    const defaults = {
      openai: "gpt-4o",

      anthropic:
        "claude-3-5-sonnet-20241022",

      google: "gemini-2.5-flash",
    };

    setModel(defaults[provider]);
  }, [provider]);

  // Instantiate TanStack React Query Hooks Block
  const { useGetSessions, useCreateSession, useUpdateSession, useDeleteSession } = usePipelineQueries();

  const { data: conversations = [], isLoading: isLoadingSessions } = useGetSessions();
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();
  const deleteSessionMutation = useDeleteSession();

  // Find the selected session object directly from our clean server cache array
  const activeSession = conversations.find((c) => c.id === activeId);

  // Handle Session Creation
  const handleCreateSession = async () => {
    createSessionMutation.mutate(
      {
        provider,
        model,
        title: `Telemetry Thread Trace ${conversations.length + 1}`,
        isStreaming: true,
      },
      {
        onSuccess: (newSession) => {
          setActiveId(newSession.id);
          setIsModalOpen(false);
          setCurrentView('chat');
        },
        onError: (error) => {
          const errorMsg = error.response?.data?.error?.message || 'Failed to provision session.';
          alert(`Initialization Error: ${errorMsg}`);
        },
      }
    );
  };

  // Handle Session Status Toggle (Active/Cancelled)
  const handleToggleStatus = () => {
    if (!activeSession) return;
    const updatedStatus = activeSession.status === 'active' ? 'cancelled' : 'active';

    updateSessionMutation.mutate({
      id: activeId,
      updates: { status: updatedStatus },
    });
  };

  // Handle Session Deletion
  const handleDeleteSession = (sessionId) => {
    deleteSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        if (activeId === sessionId) {
          setActiveId(null);
        }
      },
    });
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSelectSession={(id) => {
          setActiveId(id);
          setCurrentView('chat');
        }}
        onOpenNewChat={() => setIsModalOpen(true)}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 h-full relative overflow-hidden bg-slate-950">
        {currentView === 'chat' && (
          <ChatWorkspace
            activeSession={activeSession}
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
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={createSessionMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-40"
                >
                  {createSessionMutation.isPending ? 'Provisioning...' : 'Initialize Pipe'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;