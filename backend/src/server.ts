import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './services/RoomManager';
import { DilemaManager } from './services/DilemaManager';
import { setupSocketHandlers } from './socketHandlers';

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

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/dilemas', (req, res) => {
  res.json(dilemaManager.getAllDilemas());
});

// Configurando os manipuladores de eventos do Socket.io
setupSocketHandlers(io, roomManager);

// Iniciando o servidor
const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});