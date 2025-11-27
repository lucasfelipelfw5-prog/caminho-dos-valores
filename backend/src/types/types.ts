import { Socket } from 'socket.io'; // Adicione esta linhaexport interface EthicalProfile {  utilitarismo: number;  deontologia: number;  virtude: number;  consequencialismo: number;  relativismo: number;  dominantFramework: string;}
export interface EthicalProfile {
  utilitarismo: number;
  deontologia: number;
  virtude: number;
  consequencialismo: number;
  relativismo: number;
  dominantFramework: string;
}

export interface EthicalAnalysis {
  framework: string; // Nome do framework ético
  score: number;     // Pontuação atribuída
  explanation: string; // Explicação da pontuação
}

export interface ValueAnalysis {
  value: string;
  alignment: number;
  explanation: string; // Explicação da análise de valor
}

export interface PlayerAnswer {
  dilemaId: string;
  optionId: string;
  score: number;
}

export interface Player {
  id: string; // socketId
  name: string;
  score: number;
  answers: PlayerAnswer[];
  ethicalProfile?: EthicalProfile;
}

export interface Option {
  id: string;
  text: string;
  overallScore: number;
  feedback?: string; // Adicionada
  ethicalAnalysis: EthicalAnalysis[]; // Atualizado
  valueAnalysis: ValueAnalysis[]; // Atualizado
  culturalImpact: string;
}

export interface Dilema {
  id: string;
  title: string;
  description: string;
  context: string; // Adicionada
  category: string; // Adicionada
  options: Option[];
}

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  players: Player[];
  maxPlayers: number;
  difficulty: string;
  status: 'waiting' | 'playing' | 'finished';
  currentDilemaIndex: number;
  dilemas: Dilema[];
  playerAnswers: Map<string, Map<string, string>>; // Map<playerId, Map<dilemaId, optionId>>
  gameMode?: 'Padrão' | 'Rápido' | 'Personalizado'; // Adicionada
  totalRounds?: number; // Adicionada
  isPrivate?: boolean; // Adicionada
}

// Tipos para eventos de Socket.IO
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

export interface RoomCreatedResponse {
  roomId: string;
}

export interface RoomUpdatedResponse extends Room {}

export interface GameStartedResponse {
  dilema: Dilema;
  roomInfo: {
    currentDilemaIndex: number;
    totalDilemas: number;
  };
}

export interface NextDilemaResponse {
  dilema: Dilema;
  roomInfo: {
    currentDilemaIndex: number;
    totalDilemas: number;
  };
  playerScores: {
    id: string;
    name: string;
    score: number;
    ethicalProfile?: EthicalProfile;
  }[];
}

export interface GameFinishedResponse {
  ranking: {
    id: string;
    name: string;
    score: number;
    ethicalProfile?: EthicalProfile;
  }[];
}

export interface ErrorResponse {
  message: string;
}

export type SocketHandler = (socket: Socket) => void;

export interface PlayerRanking {
  id: string;
  name: string;
  score: number;
  ethicalProfile?: EthicalProfile;
}