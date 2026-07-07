import { useChatStore } from '../stores/chatStore';
import { 
  Search, Shield, Terminal, Network, 
  Brain, X, Activity, Lock, Globe 
} from 'lucide-react';

const TOOLS = [
  {
    id: 'osint-recon',
    name: 'OSINT Recon',
    codename: 'SHADOW_SEEKER',
    icon: Search,
    desc: 'Public intelligence gathering - domain, email, username',
    color: 'text-cyan-400',
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-400/10',
  },
  {
    id: 'pentest-assist',
    name: 'Pentest Assistant',
    codename: 'GHOST_PROTOCOL',
    icon: Shield,
    desc: 'Penetration testing framework & checklist generator',
    color: 'text-emerald-400',
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-400/10',
  },
  {
    id: 'code-analyzer',
    name: 'Code Analyzer',
    codename: 'BINARY_AUDIT',
    icon: Lock,
    desc: 'Static vulnerability analysis for JS, Python, SQL',
    color: 'text-amber-400',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/10',
  },
  {
    id: 'network-recon',
    name: 'Network Recon',
    codename: 'SPECTRE_SCAN',
    icon: Network,
    desc: 'Network mapping & port analysis framework',
    color: 'text-purple-400',
    border: 'border-purple-400/30',
    bg: 'bg-purple-400/10',
  },
  {
    id: 'ai-agent',
    name: 'AI Agent',
    codename: 'PHANTOM_EXECUTOR',
    icon: Brain,
    desc: 'Autonomous mission planning & execution',
    color: 'text-rose-400',
    border: 'border-rose-400/30',
    bg: 'bg-rose-400/10',
  },
];

export default function ToolPanel() {
  const { toolPanelOpen, toggleToolPanel, activeTools, toggleTool } = useChatStore();

  if (!toolPanelOpen) return null;

  return (
    <div className="w-96 bg-bin-900 border-l border-bin-700 flex flex-col h-full animate-slide-up">
      <div className="p-4 border-b border-bin-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-bin-accent" />
          <h2 className="font-bold text-bin-200">Tool Arsenal</h2>
        </div>
        <button 
          onClick={toggleToolPanel}
          className="p-1 hover:bg-bin-700 rounded transition-colors"
        >
          <X size={18} className="text-bin-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-bin-500 mb-4">
          Select tools to augment AI capabilities. All tools operate in legal framework only.
        </p>
        
        {TOOLS.map(tool => {
          const isActive = activeTools.includes(tool.id);
          const Icon = tool.icon;
          
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                isActive 
                  ? `${tool.border} ${tool.bg} shadow-lg` 
                  : 'border-bin-700 hover:border-bin-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isActive ? tool.bg : 'bg-bin-800'}`}>
                  <Icon size={20} className={isActive ? tool.color : 'text-bin-400'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-sm ${isActive ? 'text-bin-100' : 'text-bin-300'}`}>
                      {tool.name}
                    </h3>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-bin-success animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-bin-500 mt-1 font-mono">{tool.codename}</p>
                  <p className="text-xs text-bin-400 mt-2 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
              
              {isActive && (
                <div className={`absolute inset-0 border-2 rounded-xl ${tool.border} opacity-20 pointer-events-none`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-bin-700 bg-bin-950/50">
        <div className="flex items-center gap-2 text-xs text-bin-500">
          <Globe size={12} />
          <span>Tools connect to local server only</span>
        </div>
      </div>
    </div>
  );
}
