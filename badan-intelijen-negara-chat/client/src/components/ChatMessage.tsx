import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../stores/chatStore';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import remarkGfm from 'remark-gfm';

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-slide-up`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
        isUser 
          ? 'bg-bin-accent/20 border border-bin-accent/30' 
          : 'bg-bin-accent2/20 border border-bin-accent2/30'
      }`}>
        {isUser ? <User size={16} className="text-bin-accent" /> : <Bot size={16} className="text-bin-accent2" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`w-full p-4 rounded-xl ${
          isUser 
            ? 'bg-bin-accent/10 border border-bin-accent/20 ml-auto' 
            : 'bg-bin-800/60 border border-bin-700/50'
        }`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative group">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="p-1 bg-bin-700 rounded hover:bg-bin-600"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg !bg-bin-950 !m-0"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-bin-700/50 px-1.5 py-0.5 rounded text-sm font-mono text-bin-accent2" {...props}>
                    {children}
                  </code>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">{children}</table>
                  </div>
                );
              },
              th({ children }) {
                return <th className="border border-bin-600 px-3 py-2 bg-bin-700 font-semibold text-left">{children}</th>;
              },
              td({ children }) {
                return <td className="border border-bin-600 px-3 py-2">{children}</td>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-bin-500 font-mono">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {!isUser && (
            <button 
              onClick={copyToClipboard}
              className="text-bin-500 hover:text-bin-300 transition-colors"
            >
              {copied ? <Check size={12} className="text-bin-success" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
