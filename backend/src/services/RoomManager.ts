import { Server as SocketIOServer } from 'socket.io';
import { Player, Room, Dilema, Option, EthicalProfile } from '../types/types.js';
import { DilemaManager } from './DilemaManager.js';

// Função utilitária para gerar IDs curtos (ex: 4 letras maiúsculas)
function generateId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export class RoomManager {
  private io: SocketIOServer;
  private dilemaManager: DilemaManager;
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map(); // Map<socketId, Player>

  constructor(io: SocketIOServer, dilemaManager: DilemaManager) {
    this.io = io;
    this.dilemaManager = dilemaManager;
    this.createInitialRoom(); // Cria uma sala inicial para testes
  }

  private createInitialRoom() {
    const initialRoomId = 'TEST';
    const initialRoom: Room = {
      id: initialRoomId,
      name: 'Sala de Teste Automática',
      creatorId: 'system',
      players: [],
      maxPlayers: 4,
      difficulty: 'médio',
      status: 'waiting',
      currentDilemaIndex: 0,
      dilemas: this.dilemaManager.getDilemasForGame(5),
      playerAnswers: new Map(),
    };
    this.rooms.set(initialRoomId, initialRoom);
    console.log(`🎮 Sala de teste criada: ${initialRoomId}`);
  }

  public getRoomsArray(): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.status === 'waiting');
  }

  public registerPlayer(socketId: string, name: string): Player {
    const player: Player = {
      id: socketId,
      name: name,
      score: 0,
      answers: [],
    };
    this.players.set(socketId, player);
    return player;
  }

  public createRoom(creatorId: string, playerName: string, maxPlayers: number, difficulty: string): Room {
    if (!this.players.has(creatorId)) {
      throw new Error('Jogador não registrado.');
    }

    let roomId: string;
    do {
      roomId = generateId();
    } while (this.rooms.has(roomId));

    const creator = this.players.get(creatorId)!;
    creator.name = playerName; // Atualiza o nome do jogador se ele mudou

    const room: Room = {
      id: roomId,
      name: `Sala de ${playerName}`,
      creatorId: creatorId,
      players: [creator],
      maxPlayers: maxPlayers,
      difficulty: difficulty,
      status: 'waiting',
      currentDilemaIndex: 0,
      dilemas: this.dilemaManager.getDilemasForGame(5),
      playerAnswers: new Map(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public joinRoom(socketId: string, roomId: string, playerName: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Sala não encontrada.');
    }
    if (room.status !== 'waiting') {
      throw new Error('O jogo já começou nesta sala.');
    }
    if (room.players.length >= room.maxPlayers) {
      throw new Error('Sala cheia.');
    }

    let player = this.players.get(socketId);
    if (!player) {
      player = this.registerPlayer(socketId, playerName);
    } else {
      player.name = playerName; // Atualiza o nome do jogador
    }

    if (!room.players.some(p => p.id === socketId)) {
      room.players.push(player);
    }

    this.io.to(roomId).emit('room_updated', room);
    return room;
  }

  public startGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Sala não encontrada.');
    }
    if (room.status !== 'waiting') {
      throw new Error('O jogo já começou.');
    }
    if (room.players.length < 1) { // Mínimo de 1 jogador para testes
      throw new Error('A sala precisa de pelo menos 1 jogador para começar.');
    }

    room.status = 'playing';
    room.currentDilemaIndex = 0;
    room.playerAnswers = new Map();

    const firstDilema = room.dilemas[0];
    this.io.to(roomId).emit('game_started', {
      dilema: firstDilema,
      roomInfo: {
        currentDilemaIndex: 1,
        totalDilemas: room.dilemas.length,
      },
    });
  }

  public answerDilema(playerId: string, roomId: string, dilemaId: string, optionId: string) {
    const room = this.rooms.get(roomId);
    const player = this.players.get(playerId);

    if (!room || !player) {
      throw new Error('Sala ou jogador não encontrado.');
    }
    if (room.status !== 'playing') {
      throw new Error('O jogo não está em andamento.');
    }
    if (room.dilemas[room.currentDilemaIndex].id !== dilemaId) {
      throw new Error('Dilema incorreto ou fora de ordem.');
    }

    // 1. Registrar a resposta
    let playerAnswers = room.playerAnswers.get(playerId);
    if (!playerAnswers) {
      playerAnswers = new Map();
      room.playerAnswers.set(playerId, playerAnswers);
    }
    playerAnswers.set(dilemaId, optionId);

    // 2. Verificar se todos responderam
    const allAnswered = room.players.every(p => room.playerAnswers.get(p.id)?.has(dilemaId));

    // 3. Se todos responderam, calcular pontuação e avançar
    if (allAnswered) {
      this.calculateScores(room, dilemaId);
      this.advanceToNextDilema(room);
    }
  }

  private calculateScores(room: Room, dilemaId: string) {
    const dilema = room.dilemas.find(d => d.id === dilemaId);
    if (!dilema) return;

    room.players.forEach(player => {
      const optionId = room.playerAnswers.get(player.id)?.get(dilemaId);
      const option = dilema.options.find(opt => opt.id === optionId);

      if (option) {
        // 1. Atualizar a pontuação do jogador
        player.score += option.overallScore;

        // 2. Registrar a resposta no histórico do jogador
        player.answers.push({
          dilemaId: dilemaId,
          optionId: optionId,
          score: option.overallScore,
        });

        // 3. Calcular o perfil ético (simplificado)
        this.updateEthicalProfile(player, option);
      }
    });
  }

  private updateEthicalProfile(player: Player, option: Option) {
    if (!player.ethicalProfile) {
      player.ethicalProfile = {
        utilitarismo: 0,
        deontologia: 0,
        virtude: 0,
        consequencialismo: 0,
        relativismo: 0,
        dominantFramework: '',
      };
    }

    option.ethicalAnalysis.forEach(analysis => {
      const framework = analysis.framework.toLowerCase().replace(/\s/g, '') as keyof typeof player.ethicalProfile;
      if (player.ethicalProfile && framework in player.ethicalProfile) {
        // A tipagem de `framework` é garantida pelo filtro `framework in player.ethicalProfile`
        player.ethicalProfile[framework] += analysis.score;
      }
    });

    // Determinar o framework dominante (simplificado)
    const profile = player.ethicalProfile;
    if (profile) {
      const frameworks = Object.keys(profile).filter(key => key !== 'dominantFramework') as Array<keyof EthicalProfile>;
      let maxScore = -1;
      let dominant = '';

      frameworks.forEach(framework => {
        if (profile[framework] > maxScore) {
          maxScore = profile[framework];
          dominant = framework;
        }
      });

      profile.dominantFramework = dominant.charAt(0).toUpperCase() + dominant.slice(1);
    }
  }

  private advanceToNextDilema(room: Room) {
    room.currentDilemaIndex++;

    if (room.currentDilemaIndex < room.dilemas.length) {
      const nextDilema = room.dilemas[room.currentDilemaIndex];
      const playerScores = room.players.map(p => ({ id: p.id, name: p.name, score: p.score, ethicalProfile: p.ethicalProfile }));

      this.io.to(room.id).emit('next_dilema', {
        dilema: nextDilema,
        roomInfo: {
          currentDilemaIndex: room.currentDilemaIndex + 1,
          totalDilemas: room.dilemas.length,
        },
        playerScores: playerScores.sort((a, b) => b.score - a.score),
      });
    } else {
      this.endGame(room);
    }
  }

  private endGame(room: Room) {
    room.status = 'finished';
    const finalRanking = room.players.map(p => ({ id: p.id, name: p.name, score: p.score, ethicalProfile: p.ethicalProfile }));

    this.io.to(room.id).emit('game_finished', {
      ranking: finalRanking.sort((a, b) => b.score - a.score),
    });

    // Remove a sala após o término (ou mantém por um tempo)
    // this.rooms.delete(room.id);
    this.io.emit('rooms_updated', this.getRoomsArray());
  }

  public disconnectPlayer(socketId: string) {
    this.players.delete(socketId);

    // Remove o jogador de qualquer sala
    this.rooms.forEach(room => {
      const initialLength = room.players.length;
      room.players = room.players.filter(p => p.id !== socketId);

      if (room.players.length < initialLength) {
        // Se o criador sair, a sala é fechada
        if (room.creatorId === socketId) {
          this.rooms.delete(room.id);
          this.io.to(room.id).emit('room_closed', { message: 'O criador da sala desconectou.' });
        } else {
          this.io.to(room.id).emit('room_updated', room);
        }
      }
    });
  }
}
