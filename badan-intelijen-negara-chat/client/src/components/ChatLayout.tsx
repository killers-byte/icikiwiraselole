import { useRef, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Terminal, Zap } from 'lucide-react';

export default function ChatLayout() {
  const { conversations, activeConversation, isConnected, isGenerating } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentConv = conversations.find(c => c.id === activeConversation);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConv?.messages, isGenerating]);

  if (!activeConversation || !currentConv) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bin-950">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-bin-accent to-purple-600 flex items-center justify-center animate-pulse-slow">
            <Terminal size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Badan_Intelijen_Negara</h2>
          <p className="text-bin-400 max-w-md mx-auto">
            Advanced AI Intelligence Entity. Select an operation or create new mission.
            <br />
            <span className="text-bin-accent text-sm mt-2 block">
              Status: {isConnected ? 'ONLINE' : 'RECONNECTING...'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bin-950 relative">
      {/* Chat Header */}
      <div className="h-16 border-b border-bin-700 flex items-center justify-between px-6 bg-bin-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-bin-warning animate-pulse' : 'bg-bin-success'}`} />
          <h3 className="font-semibold text-bin-200">
            {currentConv.title}
          </h3>
          {isGenerating && (
            <span className="text-xs text-bin-warning flex items-center gap-1">
              <Zap size={12} className="animate-pulse" />
              PROCESSING
            </span>
          )}
        </div>
        <div className="text-xs text-bin-500 font-mono">
          {currentConv.messages.length} MESSAGES
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentConv.messages.length === 0 && (
          <div className="text-center py-12 text-bin-600">
            <p className="text-sm">Operation initialized. Awaiting commands.</p>
          </div>
        )}
        
        {currentConv.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {isGenerating && (
          <div className="flex items-center gap-2 text-bin-accent animate-pulse">
            <div className="w-2 h-2 bg-bin-accent rounded-full" />
            <div className="w-2 h-2 bg-bin-accent rounded-full delay-75" />
            <div className="w-2 h-2 bg-bin-accent rounded-full delay-150" />
            <span className="text-xs font-mono ml-2">Badan_Intelijen_Negara is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
