import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './services/RoomManager.js';
import { DilemaManager } from './services/DilemaManager.js';
import { setupSocketHandlers } from './socketHandlers.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const dilemaManager = new DilemaManager();
const roomManager = new RoomManager(io, dilemaManager);

// HTTP Routes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/dilemas', (req, res) => {
  res.json(dilemaManager.getAllDilemas());
});

// Socket.io events
setupSocketHandlers(io, roomManager);

// Start server
const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
