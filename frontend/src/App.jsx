import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ChatWorkspace from './views/ChatWorkspace'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'
import LogDrawer from './components/LogDrawer'
import ModelSelector from './components/ModelSelector'
import { mockConversations, mockMessages } from './utils/contant'
import api from './utils/api'

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');

  // Fetch Sidebar Sessions on Mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch Message History on Active Session Change
  useEffect(() => {
    if (!activeId) {
      setActiveMessages([]);
      return;
    }
    fetchMessages(activeId);
  }, [activeId]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setConversations(response.data);
    } catch (error) {
      console.error('Session Fetch Fault:', error.response?.data || error.message);
    }
  };

  //Fetch Message History
  const fetchMessages = async (sessionId) => {
    setIsLoadingMessages(true);
    try {
      const response = await api.get(`/sessions/${sessionId}/messages`);
      setActiveMessages(response.data);
    } catch (error) {
      console.error('Message History Sync Fault:', error.response?.data || error.message);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle Session Creation
  const handleCreateSession = async () => {
    try {
      const response = await api.post('/sessions', {
        provider,
        model,
        title: `Telemetry Thread Trace ${conversations.length + 1}`,
        isStreaming: true
      });

      const newSession = response.data;
      setConversations([newSession, ...conversations]);
      setActiveId(newSession.id);
      setIsModalOpen(false);
      setCurrentView('chat');
    } catch (error) {
      console.log(error,':::')
      const errorMsg = error.response?.data?.error?.message || 'Failed to provision session.';
      alert(`Initialization Error: ${errorMsg}`);
    }
  };

  //Handle Session Status Toggle (Active/Cancelled)
  const handleToggleStatus = async () => {
    const targetSession = conversations.find(c => c.id === activeId);
    if (!targetSession) return;

    const updatedStatus = targetSession.status === 'active' ? 'cancelled' : 'active';

    try {
      const response = await api.patch(`/sessions/${activeId}`, {
        status: updatedStatus
      });

      setConversations(conversations.map(c => c.id === activeId ? response.data : c));
    } catch (error) {
      console.error('Status Toggle Fault:', error.response?.data || error.message);
    }
  };

  // Handle Session Deletion
  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      setConversations(conversations.filter(c => c.id !== sessionId));
      if (activeId === sessionId) {
        setActiveId(null);
        setActiveMessages([]);
      }
    } catch (error) {
      console.error('Deletion Pipeline Fault:', error.response?.data || error.message);
    }
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
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 h-full relative overflow-hidden bg-slate-950">
        {currentView === 'chat' && (
          <ChatWorkspace
            activeSession={conversations.find(c => c.id === activeId)}
            messages={activeMessages}
            isLoading={isLoadingMessages}
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
