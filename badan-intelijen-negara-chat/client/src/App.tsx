import { useEffect } from 'react';
import { useChatStore } from './stores/chatStore';
import ChatLayout from './components/ChatLayout';
import Sidebar from './components/Sidebar';
import ToolPanel from './components/ToolPanel';

function App() {
  const { initWebSocket } = useChatStore();

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return (
    <div className="flex h-screen w-screen bg-bin-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex relative">
        <ChatLayout />
        <ToolPanel />
      </main>
    </div>
  );
}

export default App;
