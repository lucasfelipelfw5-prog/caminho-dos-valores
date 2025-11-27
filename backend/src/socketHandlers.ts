import { Server as SocketIOServer, Socket } from 'socket.io'; 
import { RoomManager } from './services/RoomManager.js';

// Definições de tipos
export interface CreateRoomData {
  playerName: string;
  maxPlayers: number;
  difficulty: string;
}

export interface JoinRoomData {
  roomId: string;
  playerName: string;
}

export interface StartGameData {
  roomId: string;
}

export interface AnswerDilemaData {
  roomId: string;
  dilemaId: string;
  optionId: string;
}

export interface ErrorResponse {
  message: string;
}

export const setupSocketHandlers = (io: SocketIOServer, roomManager: RoomManager) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Usuário conectado: ${socket.id}`);

    // Envia a lista de salas abertas para o novo usuário
    socket.emit('rooms_updated', roomManager.getRoomsArray());

    // Registrar jogador
  socket.on('register_player', ({ name: string }) => {  try {    const player = roomManager.registerPlayer(socket.id, data.name);    console.log(`📝 Jogador registrado: ${player.name}`);  } catch (error) {    const errorMessage: ErrorResponse = { message: error instanceof Error ? error.message : 'Erro desconhecido ao registrar jogador.' };    socket.emit('error', errorMessage);    console.error(`❌ Erro ao registrar jogador: ${errorMessage.message}`);  }});

    // Criar sala
    socket.on('create_room', (data: CreateRoomData) => {
      try {
        const room = roomManager.createRoom(socket.id, data.playerName, data.maxPlayers, data.difficulty);
        socket.join(room.id);
        socket.emit('room_created', { roomId: room.id }); // Envia o ID da sala de volta
        io.emit('rooms_updated', roomManager.getRoomsArray());
        console.log(`🎮 Sala criada: ${room.id}`);
      } catch (error) {
        const errorMessage: ErrorResponse = { message: error instanceof Error ? error.message : 'Erro desconhecido ao criar sala.' };
        socket.emit('error', errorMessage);
        console.error(`❌ Erro ao criar sala: ${errorMessage.message}`);
      }
    });

    // Entrar em sala
    socket.on('join_room', (data: JoinRoomData) => {
      try {
        const room = roomManager.joinRoom(socket.id, data.roomId, data.playerName);
        socket.join(room.id);
        io.emit('rooms_updated', roomManager.getRoomsArray());
        console.log(`🚪 Jogador ${data.playerName} entrou na sala ${room.id}`);
      } catch (error) {
        const errorMessage: ErrorResponse = { message: error instanceof Error ? error.message : 'Erro desconhecido ao entrar na sala.' };
        socket.emit('error', errorMessage);
        console.error(`❌ Erro ao entrar na sala: ${errorMessage.message}`);
      }
    });

    // Iniciar jogo
    socket.on('start_game', (data: StartGameData) => {
      try {
        roomManager.startGame(data.roomId);
        console.log(`▶️ Jogo iniciado na sala ${data.roomId}`);
      } catch (error) {
        const errorMessage: ErrorResponse = { message: error instanceof Error ? error.message : 'Erro desconhecido ao iniciar jogo.' };
        socket.emit('error', errorMessage);
        console.error(`❌ Erro ao iniciar jogo: ${errorMessage.message}`);
      }
    });

    // Responder dilema
    socket.on('answer_dilema', (data: AnswerDilemaData) => {
      try {
        roomManager.answerDilema(socket.id, data.roomId, data.dilemaId, data.optionId);
        console.log(`📝 Jogador ${socket.id} respondeu dilema ${data.dilemaId} na sala ${data.roomId}`);
      } catch (error) {
        const errorMessage: ErrorResponse = { message: error instanceof Error ? error.message : 'Erro desconhecido ao responder dilema.' };
        socket.emit('error', errorMessage);
        console.error(`❌ Erro ao responder dilema: ${errorMessage.message}`);
      }
    });

    // Desconectar
    socket.on('disconnect', () => {
      roomManager.disconnectPlayer(socket.id);
      io.emit('rooms_updated', roomManager.getRoomsArray());
      console.log(`❌ Usuário desconectado: ${socket.id}`);
    });
  });
};