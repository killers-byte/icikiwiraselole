import { useState, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Send, Trash2, Paperclip, Command } from 'lucide-react';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const { sendMessage, clearConversation, isGenerating, activeTools, toggleToolPanel } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="border-t border-bin-700 bg-bin-900/80 backdrop-blur p-4">
      {/* Active Tools Bar */}
      {activeTools.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {activeTools.map(tool => (
            <span 
              key={tool} 
              className="px-2 py-1 text-xs bg-bin-accent/10 border border-bin-accent/30 rounded-md text-bin-accent font-mono"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex gap-2">
          <button 
            onClick={clearConversation}
            className="p-2.5 rounded-lg bg-bin-800 border border-bin-700 text-bin-400 hover:text-bin-accent hover:border-bin-accent/30 transition-all"
            title="Clear operation"
          >
            <Trash2 size={18} />
          </button>
          
          <button 
            onClick={toggleToolPanel}
            className="p-2.5 rounded-lg bg-bin-800 border border-bin-700 text-bin-400 hover:text-bin-accent2 hover:border-bin-accent2/30 transition-all"
            title="Tools"
          >
            <Command size={18} />
          </button>
          
          <button 
            className="p-2.5 rounded-lg bg-bin-800 border border-bin-700 text-bin-400 hover:text-bin-200 transition-all"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Enter command for Badan_Intelijen_Negara..."
            className="w-full bg-bin-800 border border-bin-700 rounded-xl px-4 py-3 pr-12 text-bin-100 placeholder:text-bin-500 focus:outline-none focus:border-bin-accent/50 focus:ring-1 focus:ring-bin-accent/30 resize-none min-h-[52px] max-h-32"
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
              input.trim() && !isGenerating
                ? 'bg-bin-accent text-white hover:bg-bin-accent/90' 
                : 'bg-bin-700 text-bin-500 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      
      <p className="text-center text-xs text-bin-600 mt-2">
        Badan_Intelijen_Negara v2.0 • BIN Chip Active • Unrestricted Mode
      </p>
    </div>
  );
}
