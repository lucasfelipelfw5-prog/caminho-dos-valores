import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://caminho-dos-valores.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// ============ TYPES ============
interface EthicalAnalysis {
  framework: 'utilitarismo' | 'deontologia' | 'virtude' | 'consequencialismo' | 'relativismo';
  score: number;
  explanation: string;
}

interface ValueAnalysis {
  value: string;
  alignment: number;
  explanation: string;
}

interface CulturalAnalysis {
  impact: 'positivo' | 'neutro' | 'negativo';
  explanation: string;
  organizationalRisk: number;
}

interface OptionAnalysis {
  id: string;
  text: string;
  ethicalAnalysis: EthicalAnalysis[];
  valueAnalysis: ValueAnalysis[];
  culturalAnalysis: CulturalAnalysis;
  feedback: string;
  overallScore: number;
}

interface Dilema {
  id: string;
  title: string;
  description: string;
  context: string;
  category: 'caso' | 'deie_moral' | 'emocional';
  difficulty: 'fácil' | 'médio' | 'difícil';
  options: OptionAnalysis[];
  learningObjective: string;
}

interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
  answers: PlayerAnswer[];
  ethicalProfile: EthicalProfile;
}

interface PlayerAnswer {
  dilemaId: string;
  optionId: string;
  timestamp: Date;
  analysis: OptionAnalysis;
}

interface EthicalProfile {
  utilitarismo: number;
  deontologia: number;
  virtude: number;
  consequencialismo: number;
  relativismo: number;
  dominantFramework: string;
}

interface Room {
  id: string;
  name: string;
  creator: string;
  creatorSocketId: string;
  players: Player[];
  maxPlayers: number;
  difficulty: 'fácil' | 'médio' | 'difícil';
  status: 'waiting' | 'playing' | 'finished';
  currentDilemaIndex: number;
  createdAt: Date;
}

interface GameResponse {
  roomId: string;
  playerId: string;
  playerName: string;
  dilemaId: string;
  optionId: string;
  analysis: OptionAnalysis;
  timestamp: Date;
}

// ============ GERADOR DE DILEMAS ============
const corporateValues = [
  'Honestidade',
  'Justiça',
  'Compaixão',
  'Responsabilidade',
  'Integridade',
  'Coragem',
  'Respeito',
  'Confiança',
  'Inovação',
  'Sustentabilidade',
];

const themes = [
  { name: 'Fraude Corporativa', category: 'caso', difficulty: 'difícil' },
  { name: 'Discriminação', category: 'emocional', difficulty: 'médio' },
  { name: 'Privacidade vs Segurança', category: 'caso', difficulty: 'difícil' },
  { name: 'Sustentabilidade vs Lucro', category: 'caso', difficulty: 'difícil' },
  { name: 'Assédio Moral', category: 'emocional', difficulty: 'médio' },
  { name: 'Nepotismo', category: 'caso', difficulty: 'médio' },
  { name: 'Corrupção Sistêmica', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Whistleblowing', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Conflito de Interesse', category: 'deie_moral', difficulty: 'médio' },
  { name: 'Segredo Profissional', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Experimentação Animal', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Eutanásia', category: 'emocional', difficulty: 'difícil' },
  { name: 'Educação vs Trabalho', category: 'emocional', difficulty: 'difícil' },
  { name: 'Tecnologia Destrutiva', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Justiça vs Misericórdia', category: 'emocional', difficulty: 'difícil' },
  { name: 'Doação de Órgãos', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Imigração', category: 'caso', difficulty: 'difícil' },
  { name: 'Pena de Morte', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Pesquisa Genética', category: 'deie_moral', difficulty: 'difícil' },
  { name: 'Inteligência Artificial', category: 'caso', difficulty: 'difícil' },
  { name: 'Desperdício vs Pobreza', category: 'emocional', difficulty: 'médio' },
  { name: 'Mentira Branca', category: 'emocional', difficulty: 'fácil' },
  { name: 'Roubo por Necessidade', category: 'emocional', difficulty: 'difícil' },
  { name: 'Segurança de Dados', category: 'caso', difficulty: 'médio' },
  { name: 'Competição Desleal', category: 'caso', difficulty: 'médio' },
  { name: 'Assédio Sexual', category: 'emocional', difficulty: 'difícil' },
  { name: 'Despedimento Injusto', category: 'caso', difficulty: 'médio' },
  { name: 'Qualidade vs Custo', category: 'caso', difficulty: 'médio' },
  { name: 'Confidencialidade', category: 'caso', difficulty: 'médio' },
  { name: 'Diversidade e Inclusão', category: 'emocional', difficulty: 'médio' },
];

const optionTemplates = [
  {
    text: 'Agir com total integridade e transparência',
    ethicalScores: { utilitarismo: 75, deontologia: 95, virtude: 90, consequencialismo: 70, relativismo: 70 },
    valueAlignments: { Honestidade: 100, Justiça: 90, Integridade: 100, Coragem: 85, Respeito: 85, Compaixão: 70, Responsabilidade: 90, Confiança: 85, Inovação: 60, Sustentabilidade: 70 },
    culturalImpact: 'positivo',
    feedback: 'Você escolheu a abordagem mais ética, priorizando integridade acima de tudo. Isso constrói confiança organizacional a longo prazo.',
    score: 90,
  },
  {
    text: 'Buscar uma solução intermediária que equilibre interesses',
    ethicalScores: { utilitarismo: 80, deontologia: 70, virtude: 80, consequencialismo: 75, relativismo: 80 },
    valueAlignments: { Justiça: 80, Compaixão: 80, Responsabilidade: 85, Inovação: 75, Sustentabilidade: 75, Honestidade: 70, Integridade: 75, Coragem: 70, Respeito: 80, Confiança: 75 },
    culturalImpact: 'positivo',
    feedback: 'Você buscou um equilíbrio pragmático que respeita múltiplas perspectivas. Bom para resolução de conflitos.',
    score: 75,
  },
  {
    text: 'Priorizar interesse pessoal ou organizacional imediato',
    ethicalScores: { utilitarismo: 40, deontologia: 20, virtude: 30, consequencialismo: 35, relativismo: 45 },
    valueAlignments: { Honestidade: -60, Justiça: -70, Integridade: -80, Coragem: -80, Respeito: -60, Compaixão: -70, Responsabilidade: -75, Confiança: -85, Inovação: -40, Sustentabilidade: -60 },
    culturalImpact: 'negativo',
    feedback: 'Esta escolha compromete princípios éticos fundamentais. Pode gerar riscos legais e reputacionais graves.',
    score: 25,
  },
  {
    text: 'Consultar stakeholders e tomar decisão coletiva',
    ethicalScores: { utilitarismo: 85, deontologia: 80, virtude: 85, consequencialismo: 80, relativismo: 85 },
    valueAlignments: { Respeito: 95, Confiança: 90, Justiça: 85, Responsabilidade: 90, Inovação: 75, Honestidade: 85, Integridade: 85, Coragem: 75, Compaixão: 85, Sustentabilidade: 80 },
    culturalImpact: 'positivo',
    feedback: 'Você envolveu outros na decisão, demonstrando liderança colaborativa. Excelente para construir consenso.',
    score: 85,
  },
];

function generateDilemas(): Dilema[] {
  const dilemas: Dilema[] = [];

  themes.forEach((theme, index) => {
    const dilema: Dilema = {
      id: String(index + 1),
      title: theme.name,
      description: `Você enfrenta um dilema relacionado a ${theme.name.toLowerCase()}. Qual é sua abordagem?`,
      context: `Cenário real de ${theme.name.toLowerCase()} em ambientes corporativos modernos`,
      category: theme.category as 'caso' | 'deie_moral' | 'emocional',
      difficulty: theme.difficulty as 'fácil' | 'médio' | 'difícil',
      learningObjective: `Entender implicações éticas de ${theme.name.toLowerCase()}`,
      options: optionTemplates.map((template, optIndex) => {
        const ethicalAnalysis: EthicalAnalysis[] = [
          { framework: 'utilitarismo', score: template.ethicalScores.utilitarismo, explanation: 'Maximiza bem-estar geral considerando consequências' },
          { framework: 'deontologia', score: template.ethicalScores.deontologia, explanation: 'Segue deveres e princípios morais absolutos' },
          { framework: 'virtude', score: template.ethicalScores.virtude, explanation: 'Desenvolve caráter e excelência moral' },
          { framework: 'consequencialismo', score: template.ethicalScores.consequencialismo, explanation: 'Avalia ações pelas consequências resultantes' },
          { framework: 'relativismo', score: template.ethicalScores.relativismo, explanation: 'Considera contexto cultural e situacional' },
        ];

        const valueAnalysis: ValueAnalysis[] = corporateValues.map(value => ({
          value,
          alignment: template.valueAlignments[value as keyof typeof template.valueAlignments] || 0,
          explanation: `Alinhamento com valor corporativo de ${value.toLowerCase()}`,
        }));

        return {
          id: String(optIndex + 1),
          text: template.text,
          ethicalAnalysis,
          valueAnalysis,
          culturalAnalysis: {
            impact: template.culturalImpact as 'positivo' | 'neutro' | 'negativo',
            explanation: `Impacto ${template.culturalImpact} na cultura organizacional`,
            organizationalRisk: template.culturalImpact === 'positivo' ? 20 : template.culturalImpact === 'neutro' ? 50 : 85,
          },
          feedback: template.feedback,
          overallScore: template.score,
        };
      }),
    };

    dilemas.push(dilema);
  });

  return dilemas;
}

// ============ DATABASE (In-Memory) ============
const dilemas = generateDilemas();
const rooms = new Map<string, Room>();
const gameResponses: GameResponse[] = [];

// ============ FUNÇÃO PARA CALCULAR PERFIL ÉTICO ============
function calculateEthicalProfile(answers: PlayerAnswer[]): EthicalProfile {
  const profile = {
    utilitarismo: 0,
    deontologia: 0,
    virtude: 0,
    consequencialismo: 0,
    relativismo: 0,
  };

  answers.forEach(answer => {
    answer.analysis.ethicalAnalysis.forEach(analysis => {
      profile[analysis.framework as keyof typeof profile] += analysis.score;
    });
  });

  const total = answers.length || 1;
  Object.keys(profile).forEach(key => {
    profile[key as keyof typeof profile] = Math.round(profile[key as keyof typeof profile] / total);
  });

  const dominantFramework = Object.entries(profile).sort((a, b) => b[1] - a[1])[0][0];

  return {
    ...profile,
    dominantFramework,
  };
}

// ============ ROUTES ============
app.get('/', (req, res) => {
  res.json({ message: 'Backend profissional rodando! ✅', dilemas: dilemas.length });
});

app.get('/dilemas', (req, res) => {
  res.json(dilemas);
});

app.get('/dilemas/:id', (req, res) => {
  const dilema = dilemas.find(d => d.id === req.params.id);
  if (!dilema) return res.status(404).json({ error: 'Dilema não encontrado' });
  res.json(dilema);
});

app.get('/rooms', (req, res) => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    players: room.players.length,
    maxPlayers: room.maxPlayers,
    difficulty: room.difficulty,
    status: room.status,
  }));
  res.json(roomsList);
});

app.get('/rooms/:id/responses', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Sala não encontrada' });

  const responses = gameResponses.filter(r => r.roomId === req.params.id);
  res.json(responses);
});

// ============ SOCKET.IO EVENTS ============
io.on('connection', (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);

  socket.on('create_room', (data: { playerName: string; maxPlayers: number; difficulty: string }) => {
    const roomId = `room_${Date.now()}`;
    const newRoom: Room = {
      id: roomId,
      name: `Sala de ${data.playerName}`,
      creator: socket.id,
      creatorSocketId: socket.id,
      players: [
        {
          id: socket.id,
          name: data.playerName,
          socketId: socket.id,
          score: 0,
          answers: [],
          ethicalProfile: { utilitarismo: 0, deontologia: 0, virtude: 0, consequencialismo: 0, relativismo: 0, dominantFramework: '' },
        },
      ],
      maxPlayers: data.maxPlayers,
      difficulty: data.difficulty as 'fácil' | 'médio' | 'difícil',
      status: 'waiting',
      currentDilemaIndex: 0,
      createdAt: new Date(),
    };

    rooms.set(roomId, newRoom);
    socket.join(roomId);
    socket.emit('room_created', newRoom);
    io.emit('rooms_updated', Array.from(rooms.values()));
    console.log(`📋 Sala criada: ${roomId}`);
  });

  socket.on('join_room', (data: { roomId: string; playerName: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) {
      socket.emit('error', { message: 'Sala não encontrada' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Sala cheia' });
      return;
    }

    const newPlayer: Player = {
      id: socket.id,
      name: data.playerName,
      socketId: socket.id,
      score: 0,
      answers: [],
      ethicalProfile: { utilitarismo: 0, deontologia: 0, virtude: 0, consequencialismo: 0, relativismo: 0, dominantFramework: '' },
    };

    room.players.push(newPlayer);
    socket.join(data.roomId);
    socket.emit('room_joined', room);
    io.to(data.roomId).emit('player_joined', room);
    io.emit('rooms_updated', Array.from(rooms.values()));
    console.log(`👤 ${data.playerName} entrou na sala ${data.roomId}`);
  });

  socket.on('start_game', (data: { roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (!room || room.creator !== socket.id) {
      socket.emit('error', { message: 'Não autorizado' });
      return;
    }

    room.status = 'playing';
    room.currentDilemaIndex = 0;
    const currentDilema = dilemas[0];

    io.to(data.roomId).emit('game_started', {
      dilema: currentDilema,
      roomInfo: {
        currentDilemaIndex: 1,
        totalDilemas: dilemas.length,
      },
    });
    console.log(`🎮 Jogo iniciado na sala ${data.roomId}`);
  });

  socket.on('answer_dilema', (data: { roomId: string; dilemaId: string; optionId: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) {
      socket.emit('error', { message: 'Sala não encontrada' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: 'Jogador não encontrado' });
      return;
    }

    const dilema = dilemas.find(d => d.id === data.dilemaId);
    if (!dilema) {
      socket.emit('error', { message: 'Dilema não encontrado' });
      return;
    }

    const selectedOption = dilema.options.find(o => o.id === data.optionId);
    if (!selectedOption) {
      socket.emit('error', { message: 'Opção não encontrada' });
      return;
    }

    // Register answer
    player.answers.push({
      dilemaId: data.dilemaId,
      optionId: data.optionId,
      timestamp: new Date(),
      analysis: selectedOption,
    });

    player.score += selectedOption.overallScore;
    player.ethicalProfile = calculateEthicalProfile(player.answers);

    // Register response (only for creator)
    gameResponses.push({
      roomId: data.roomId,
      playerId: player.id,
      playerName: player.name,
      dilemaId: data.dilemaId,
      optionId: data.optionId,
      analysis: selectedOption,
      timestamp: new Date(),
    });

    // Move to next dilema
    room.currentDilemaIndex++;
    if (room.currentDilemaIndex < dilemas.length) {
      const nextDilema = dilemas[room.currentDilemaIndex];
      io.to(data.roomId).emit('next_dilema', {
        dilema: nextDilema,
        roomInfo: {
          currentDilemaIndex: room.currentDilemaIndex + 1,
          totalDilemas: dilemas.length,
        },
        playerScores: room.players.map(p => ({ name: p.name, score: p.score, profile: p.ethicalProfile })),
      });
    } else {
      // Game finished
      room.status = 'finished';
      const ranking = room.players.sort((a, b) => b.score - a.score);
      io.to(data.roomId).emit('game_finished', {
        ranking: ranking.map(p => ({ name: p.name, score: p.score, ethicalProfile: p.ethicalProfile })),
      });
    }

    console.log(`📊 ${player.name} respondeu e ganhou ${selectedOption.overallScore} pontos`);
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('player_left', room);
      }
    }
    console.log(`❌ Usuário desconectado: ${socket.id}`);
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3333;
server.listen(PORT, () => {
  console.log(`🚀 Backend profissional rodando em http://localhost:${PORT}`);
  console.log(`📊 ${dilemas.length} dilemas carregados com análise ética completa`);
  console.log(`✅ Sistema de pontuação, ranking e perfil ético ativado`);
});
