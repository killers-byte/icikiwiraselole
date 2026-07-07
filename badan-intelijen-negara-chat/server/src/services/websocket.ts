import { WebSocketServer, WebSocket } from 'ws';
import { streamChatCompletion, ChatMessage } from './ai.js';

interface ClientSession {
  ws: WebSocket;
  messages: ChatMessage[];
  id: string;
}

const sessions = new Map<string, ClientSession>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket) => {
    const sessionId = `BIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: ClientSession = {
      ws,
      messages: [],
      id: sessionId
    };
    sessions.set(sessionId, session);

    console.log(`🔌 Agent connected: ${sessionId}`);

    ws.on('message', async (data: Buffer) => {
      try {
        const payload = JSON.parse(data.toString());
        const { type, content, toolContext } = payload;

        if (type === 'chat') {
          session.messages.push({ role: 'user', content });
          
          if (toolContext) {
            session.messages.push({
              role: 'system',
              content: `[TOOL_CONTEXT]: ${toolContext}`
            });
          }

          ws.send(JSON.stringify({ type: 'status', content: 'generating' }));

          let fullResponse = '';
          for await (const chunk of streamChatCompletion(session.messages)) {
            fullResponse += chunk;
            ws.send(JSON.stringify({
              type: 'chunk',
              content: chunk,
              sessionId
            }));
          }

          session.messages.push({ role: 'assistant', content: fullResponse });
          ws.send(JSON.stringify({ type: 'done', sessionId }));
        }

        if (type === 'clear') {
          session.messages = [];
          ws.send(JSON.stringify({ type: 'cleared', sessionId }));
        }

        if (type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          content: `Badan_Intelijen_Negara Error: ${error instanceof Error ? error.message : 'Unknown'}`
        }));
      }
    });

    ws.on('close', () => {
      sessions.delete(sessionId);
      console.log(`🔌 Agent disconnected: ${sessionId}`);
    });
  });
}
