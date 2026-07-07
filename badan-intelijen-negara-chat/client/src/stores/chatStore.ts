import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  result: any;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  ws: WebSocket | null;
  isConnected: boolean;
  isGenerating: boolean;
  activeTools: string[];
  sidebarOpen: boolean;
  toolPanelOpen: boolean;
  
  // Actions
  initWebSocket: () => void;
  sendMessage: (content: string) => void;
  clearConversation: () => void;
  createConversation: () => void;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  toggleTool: (tool: string) => void;
  toggleSidebar: () => void;
  toggleToolPanel: () => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
}

const WS_URL = 'ws://localhost:3001/ws';

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversation: null,
      ws: null,
      isConnected: false,
      isGenerating: false,
      activeTools: [],
      sidebarOpen: true,
      toolPanelOpen: false,

      initWebSocket: () => {
        const ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
          set({ ws, isConnected: true });
          console.log('💀 Connected to Badan_Intelijen_Negara Core');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const { activeConversation, conversations } = get();
          
          if (!activeConversation) return;

          if (data.type === 'chunk') {
            const conv = conversations.find(c => c.id === activeConversation);
            if (!conv) return;
            
            const lastMsg = conv.messages[conv.messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              get().updateMessage(activeConversation, lastMsg.id, lastMsg.content + data.content);
            } else {
              get().addMessage(activeConversation, {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: data.content,
                timestamp: Date.now(),
              });
            }
          }

          if (data.type === 'done') {
            set({ isGenerating: false });
          }

          if (data.type === 'status' && data.content === 'generating') {
            set({ isGenerating: true });
          }
        };

        ws.onclose = () => {
          set({ isConnected: false, ws: null });
          setTimeout(() => get().initWebSocket(), 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      },

      sendMessage: (content: string) => {
        const { ws, activeConversation, activeTools } = get();
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const convId = activeConversation || get().createConversation();
        
        get().addMessage(convId, {
          id: `msg-${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        });

        ws.send(JSON.stringify({
          type: 'chat',
          content,
          toolContext: activeTools.length > 0 ? `Active tools: ${activeTools.join(', ')}` : null
        }));
      },

      clearConversation: () => {
        const { activeConversation, ws } = get();
        if (!activeConversation || !ws) return;
        ws.send(JSON.stringify({ type: 'clear' }));
        set(state => ({
          conversations: state.conversations.map(c => 
            c.id === activeConversation ? { ...c, messages: [] } : c
          )
        }));
      },

      createConversation: () => {
        const id = `conv-${Date.now()}`;
        const newConv: Conversation = {
          id,
          title: 'New Operation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({
          conversations: [...state.conversations, newConv],
          activeConversation: id,
        }));
        return id;
      },

      setActiveConversation: (id: string) => {
        set({ activeConversation: id });
      },

      deleteConversation: (id: string) => {
        set(state => {
          const filtered = state.conversations.filter(c => c.id !== id);
          return {
            conversations: filtered,
            activeConversation: state.activeConversation === id 
              ? (filtered[0]?.id || null) 
              : state.activeConversation,
          };
        });
      },

      toggleTool: (tool: string) => {
        set(state => ({
          activeTools: state.activeTools.includes(tool)
            ? state.activeTools.filter(t => t !== tool)
            : [...state.activeTools, tool]
        }));
      },

      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      toggleToolPanel: () => set(state => ({ toolPanelOpen: !state.toolPanelOpen })),

      addMessage: (conversationId: string, message: Message) => {
        set(state => ({
          conversations: state.conversations.map(c => 
            c.id === conversationId 
              ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
              : c
          )
        }));
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set(state => ({
          conversations: state.conversations.map(c => 
            c.id === conversationId 
              ? {
                  ...c,
                  messages: c.messages.map(m => 
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          )
        }));
      },
    }),
    {
      name: 'bin-chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
