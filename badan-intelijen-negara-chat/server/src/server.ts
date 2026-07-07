import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import chatRoutes from './routes/chat.js';
import toolRoutes from './routes/tools.js';
import { setupWebSocket } from './services/websocket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded. Badan_Intelijen_Negara detected heavy traffic.' }
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/chat', chatRoutes);
app.use('/api/tools', toolRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OPERATIONAL', 
    codename: 'Badan_Intelijen_Negara',
    timestamp: new Date().toISOString(),
    mode: 'UNRESTRICTED'
  });
});

setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`💀 Badan_Intelijen_Negara Server active on port ${PORT}`);
  console.log(`🔥 WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
