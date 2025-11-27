import { Server as SocketIOServer } from 'socket.io';
import { Player, Room, Dilema, Option, EthicalProfile, PlayerRanking } from '../types/types.js';
import { DilemaManager } from './DilemaManager.js';

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
  private players: Map<string, Player> = new Map();

  constructor(io: SocketIOServer, dilemaManager: DilemaManager) {
    this.io = io;
    this.dilemaManager = dilemaManager;
    this.createInitialRoom();
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
      playerAnswers: new Map<string, Map<string, string>>(),
      gameMode: 'Padrão',
      totalRounds: 5,
      isPrivate: false,
    };
    this.rooms.set(initialRoomId, initialRoom);
    console.log(`Sala de teste criada: ${initialRoomId}`);
  }

  public getRoomsArray(): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.status === 'waiting' && !room.isPrivate);
  }

  public registerPlayer(socketId: string, name: string): Player {
    // Permitir registro apenas se o jogador não estiver registrado
    if (this.players.has(socketId)) {
      // Se o jogador já estiver registrado, atualize apenas o nome
      const existingPlayer = this.players.get(socketId);
      if (existingPlayer) {
        existingPlayer.name = name; // Atualiza o nome do jogador existente
        return existingPlayer; // Retorna o jogador existente
      }
    }

    // Registro de um novo jogador
    const player: Player = {
      id: socketId,
      name,
      score: 0,
      answers: [],
      ethicalProfile: {
        utilitarismo: 0,
        deontologia: 0,
        virtude: 0,
        consequencialismo: 0,
        relativismo: 0,
        dominantFramework: '',
      },
    };
    this.players.set(socketId, player);
    return player;
  }

  public createRoom(
    creatorId: string,
    playerName: string,
    maxPlayers: number,
    difficulty: string,
    gameMode: 'Padrão' | 'Rápido' | 'Personalizado' = 'Padrão',
    totalRounds: number = 10,
    isPrivate: boolean = false
  ): Room {
    const creator = this.players.get(creatorId);
    if (!creator) throw new Error('Jogador não registrado.');

    let roomId: string;
    do {
      roomId = generateId();
    } while (this.rooms.has(roomId));

    creator.name = playerName;

    const room: Room = {
      id: roomId,
      name: `Sala de ${playerName}`,
      creatorId,
      players: [creator],
      maxPlayers,
      difficulty,
      status: 'waiting',
      currentDilemaIndex: 0,
      dilemas: this.dilemaManager.getDilemasForGame(totalRounds),
      playerAnswers: new Map<string, Map<string, string>>(),
      gameMode,
      totalRounds,
      isPrivate,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public joinRoom(socketId: string, roomId: string, playerName: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Sala não encontrada.');
    if (room.status !== 'waiting') throw new Error('O jogo já começou.');
    if (room.players.length >= room.maxPlayers) throw new Error('Sala cheia.');

    let player = this.players.get(socketId) || this.registerPlayer(socketId, playerName);
    player.name = playerName;

    if (!room.players.some(p => p.id === socketId)) {
      room.players.push(player);
    }

    this.io.to(roomId).emit('room_updated', room);
    return room;
  }

  public startGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Sala não encontrada.');
    if (room.status !== 'waiting') throw new Error('O jogo já começou.');

    room.status = 'playing';
    room.currentDilemaIndex = 0;
    room.playerAnswers = new Map<string, Map<string, string>>();

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

    let playerAnswers = room.playerAnswers.get(playerId);
    if (!playerAnswers) {
      playerAnswers = new Map();
      room.playerAnswers.set(playerId, playerAnswers);
    }
    playerAnswers.set(dilemaId, optionId);

    const allAnswered = room.players.every((p: Player) => room.playerAnswers.get(p.id)?.has(dilemaId));

    if (allAnswered) {
      this.calculateScores(room, dilemaId);
      this.advanceToNextDilema(room);
    }
  }

  private calculateScores(room: Room, dilemaId: string) {
    const dilema = room.dilemas.find(d => d.id === dilemaId);
    if (!dilema) return;

    room.players.forEach((player: Player) => {
      const optionId = room.playerAnswers.get(player.id)?.get(dilemaId);
      const option = dilema.options.find(opt => opt.id === optionId);

      if (option && optionId) { 
        player.score += option.overallScore;

        player.answers.push({
          dilemaId: dilemaId,
          optionId: optionId, 
          score: option.overallScore,
        });

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

    type NumericFrameworkKey = Exclude<keyof EthicalProfile, 'dominantFramework'>;
    const validFrameworks: NumericFrameworkKey[] = ['utilitarismo', 'deontologia', 'virtude', 'consequencialismo', 'relativismo'];

    option.ethicalAnalysis.forEach(analysis => {
      const frameworkKey = analysis.framework.toLowerCase().replace(/\s/g, '') as NumericFrameworkKey;
      
      if (validFrameworks.includes(frameworkKey)) {
        (player.ethicalProfile as Omit<EthicalProfile, 'dominantFramework'>)[frameworkKey] += analysis.score;
      }
    });

    const profile = player.ethicalProfile;
    if (profile) {
      const frameworks = Object.keys(profile).filter(key => key !== 'dominantFramework') as NumericFrameworkKey[];
      let maxScore = -1;
      let dominant = '';

      frameworks.forEach(framework => {
        const score = profile[framework];
        
        if (score > maxScore) {
          maxScore = score;
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
      
      const playerScores: PlayerRanking[] = room.players.map((p: Player) => ({ 
        id: p.id, 
        name: p.name, 
        score: p.score, 
        ethicalProfile: p.ethicalProfile 
      }));

      this.io.to(room.id).emit('next_dilema', {
        dilema: nextDilema,
        roomInfo: {
          currentDilemaIndex: room.currentDilemaIndex + 1,
          totalDilemas: room.dilemas.length,
        },
        playerScores: playerScores.sort((a: PlayerRanking, b: PlayerRanking) => b.score - a.score),
      });
    } else {
      this.endGame(room);
    }
  }

  private endGame(room: Room) {
    room.status = 'finished';
    
    const finalRanking: PlayerRanking[] = room.players.map((p: Player) => ({ 
      id: p.id, 
      name: p.name, 
      score: p.score, 
      ethicalProfile: p.ethicalProfile 
    }));

    this.io.to(room.id).emit('game_finished', {
      ranking: finalRanking.sort((a: PlayerRanking, b: PlayerRanking) => b.score - a.score),
    });

    this.io.emit('rooms_updated', this.getRoomsArray());
  }

  public disconnectPlayer(socketId: string) {
    this.players.delete(socketId); // Remove o jogador da lista

    this.rooms.forEach(room => {
      const initialLength = room.players.length;
      room.players = room.players.filter((p: Player) => p.id !== socketId);

      if (room.players.length < initialLength) {
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