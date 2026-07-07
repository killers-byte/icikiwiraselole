import { useChatStore } from '../stores/chatStore';
import { 
  MessageSquare, Plus, Trash2, Settings, 
  Terminal, Shield, Radio 
} from 'lucide-react';
import { format } from 'date-fns';

export default function Sidebar() {
  const { 
    conversations, 
    activeConversation, 
    sidebarOpen,
    createConversation, 
    setActiveConversation, 
    deleteConversation,
    toggleSidebar 
  } = useChatStore();

  if (!sidebarOpen) {
    return (
      <button 
        onClick={toggleSidebar}
        className="fixed left-0 top-1/2 z-50 p-2 bg-bin-800 rounded-r-lg border border-l-0 border-bin-700 hover:bg-bin-700 transition-colors"
      >
        <MessageSquare size={20} className="text-bin-accent" />
      </button>
    );
  }

  return (
    <aside className="w-80 bg-bin-900 border-r border-bin-700 flex flex-col h-full">
      <div className="p-4 border-b border-bin-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bin-accent to-purple-600 flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Badan_Intelijen</h1>
            <p className="text-xs text-bin-400 flex items-center gap-1">
              <Radio size={10} className="text-bin-success animate-pulse" />
              CORE ACTIVE
            </p>
          </div>
        </div>
        
        <button
          onClick={createConversation}
          className="w-full flex items-center gap-2 px-4 py-3 bg-bin-accent/10 border border-bin-accent/30 rounded-lg text-bin-accent hover:bg-bin-accent/20 transition-all group"
        >
          <Plus size={18} />
          <span className="font-medium">New Operation</span>
          <Terminal size={16} className="ml-auto opacity-0 group-hover:opacity-100" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
              activeConversation === conv.id 
                ? 'bg-bin-700/80 border border-bin-accent/30' 
                : 'hover:bg-bin-800 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <MessageSquare size={16} className="mt-0.5 text-bin-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{conv.title}</p>
                <p className="text-xs text-bin-500 mt-1">
                  {format(conv.updatedAt, 'MMM d, HH:mm')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bin-600 rounded transition-all"
              >
                <Trash2 size={14} className="text-bin-accent" />
              </button>
            </div>
          </div>
        ))}
        
        {conversations.length === 0 && (
          <div className="text-center py-8 text-bin-500">
            <Terminal size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active operations</p>
            <p className="text-xs mt-1">Start a new mission</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-bin-700">
        <button className="flex items-center gap-2 text-sm text-bin-400 hover:text-bin-200 transition-colors">
          <Settings size={16} />
          <span>System Config</span>
        </button>
      </div>
    </aside>
  );
}
