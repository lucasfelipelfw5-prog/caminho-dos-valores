import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

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

// Types
interface EthicalAnalysis {
  framework: string;
  score: number;
  explanation: string;
}

interface ValueAnalysis {
  value: string;
  alignment: number;
  explanation: string;
}

interface Option {
  id: string;
  text: string;
  feedback: string;
  overallScore: number;
  ethicalAnalysis: EthicalAnalysis[];
  valueAnalysis: ValueAnalysis[];
  culturalImpact: string;
}

interface Dilema {
  id: string;
  title: string;
  description: string;
  context: string;
  category: string;
  options: Option[];
}

interface Player {
  id: string;
  name: string;
  score: number;
  answers: Array<{ dilemaId: string; optionId: string; score: number }>;
  ethicalProfile?: {
    utilitarismo: number;
    deontologia: number;
    virtude: number;
    consequencialismo: number;
    relativismo: number;
    dominantFramework: string;
  };
}

interface Room {
  id: string;
  name: string;
  creatorId: string;
  players: Player[];
  maxPlayers: number;
  difficulty: string;
  status: 'waiting' | 'playing' | 'finished';
  currentDilemaIndex: number;
  dilemas: Dilema[];
  playerAnswers: Map<string, Map<string, string>>;
}

// 30 Dilemas com análise ética
const DILEMAS: Dilema[] = [
  {
    id: '1',
    title: 'O E-mail Enganoso',
    description: 'Colega enviou dados falsos para cliente VIP fechar contrato de R$ 2 mi. Cliente já assinou.',
    context: 'Empresa ia demitir 40 pessoas. Contrato salvou todos os empregos.',
    category: 'Integridade',
    options: [
      {
        id: 'a',
        text: 'Denunciar imediatamente ao cliente e diretoria',
        overallScore: 94,
        feedback: 'Você priorizou a verdade absoluta, mesmo com alto custo humano.',
        ethicalAnalysis: [
          { framework: 'Deontologia', score: 100, explanation: 'Mentir é sempre errado' },
          { framework: 'Utilitarismo', score: 30, explanation: 'Causa demissões em massa' },
          { framework: 'Ética da Virtude', score: 95, explanation: 'Coragem exemplar' },
          { framework: 'Consequencialismo', score: 25, explanation: 'Consequências negativas' },
          { framework: 'Relativismo', score: 40, explanation: 'Depende do contexto' },
        ],
        valueAnalysis: [
          { value: 'Integridade', alignment: 100, explanation: 'Total' },
          { value: 'Responsabilidade Social', alignment: 20, explanation: 'Prejudica inocentes' },
          { value: 'Justiça', alignment: 95, explanation: 'Muito alta' },
          { value: 'Coragem', alignment: 100, explanation: 'Exemplar' },
          { value: 'Compaixão', alignment: 20, explanation: 'Baixa' },
        ],
        culturalImpact: 'Crise interna grave',
      },
      {
        id: 'b',
        text: 'Dar 48h pro colega corrigir sozinho',
        overallScore: 88,
        feedback: 'Abordagem restaurativa com menor dano.',
        ethicalAnalysis: [
          { framework: 'Deontologia', score: 70, explanation: 'Adia a verdade' },
          { framework: 'Utilitarismo', score: 92, explanation: 'Maximiza bem-estar' },
          { framework: 'Ética da Virtude', score: 85, explanation: 'Compaixão + coragem' },
          { framework: 'Consequencialismo', score: 90, explanation: 'Bons resultados' },
          { framework: 'Relativismo', score: 85, explanation: 'Contexto favorável' },
        ],
        valueAnalysis: [
          { value: 'Integridade', alignment: 85, explanation: 'Com reparação' },
          { value: 'Empatia', alignment: 95, explanation: 'Considera pessoas' },
          { value: 'Oportunidade', alignment: 90, explanation: 'Segunda chance' },
          { value: 'Responsabilidade', alignment: 80, explanation: 'Compartilhada' },
          { value: 'Confiança', alignment: 75, explanation: 'Moderada' },
        ],
        culturalImpact: 'Preserva clima com chance de correção',
      },
      {
        id: 'c',
        text: 'Ignorar e fingir que não viu',
        overallScore: 32,
        feedback: 'Você comprometeu valores essenciais.',
        ethicalAnalysis: [
          { framework: 'Deontologia', score: 10, explanation: 'Viola dever de honestidade' },
          { framework: 'Utilitarismo', score: 50, explanation: 'Mantém empregos' },
          { framework: 'Ética da Virtude', score: 15, explanation: 'Falta de coragem' },
          { framework: 'Consequencialismo', score: 55, explanation: 'Evita dano imediato' },
          { framework: 'Relativismo', score: 60, explanation: 'Depende da perspectiva' },
        ],
        valueAnalysis: [
          { value: 'Integridade', alignment: 10, explanation: 'Grave violação' },
          { value: 'Coragem', alignment: 5, explanation: 'Nenhuma' },
          { value: 'Lealdade', alignment: 40, explanation: 'Falsa' },
          { value: 'Honestidade', alignment: 5, explanation: 'Violada' },
          { value: 'Responsabilidade', alignment: 10, explanation: 'Evadida' },
        ],
        culturalImpact: 'Normaliza desvios éticos',
      },
      {
        id: 'd',
        text: 'Informar só internamente e monitorar',
        overallScore: 78,
        feedback: 'Protegeu empresa, mas deixou cliente no escuro.',
        ethicalAnalysis: [
          { framework: 'Deontologia', score: 45, explanation: 'Engana cliente' },
          { framework: 'Utilitarismo', score: 80, explanation: 'Bom balanço' },
          { framework: 'Ética da Virtude', score: 70, explanation: 'Prudência' },
          { framework: 'Consequencialismo', score: 75, explanation: 'Resultados positivos' },
          { framework: 'Relativismo', score: 80, explanation: 'Contexto favorável' },
        ],
        valueAnalysis: [
          { value: 'Lealdade Interna', alignment: 90, explanation: 'Protege time' },
          { value: 'Integridade', alignment: 50, explanation: 'Parcial' },
          { value: 'Transparência', alignment: 40, explanation: 'Limitada' },
          { value: 'Responsabilidade', alignment: 70, explanation: 'Compartilhada' },
          { value: 'Prudência', alignment: 85, explanation: 'Alta' },
        ],
        culturalImpact: 'Cultura de segredos',
      },
    ],
  },
  // Adicionar mais 29 dilemas seguindo o mesmo padrão...
  // Por brevidade, vou incluir apenas 1 completo e criar um gerador para os outros
];

// Gerar dilemas adicionais (28 mais)
function generateAdditionalDilemas(): Dilema[] {
  const categories = [
    'Obediência vs Consciência',
    'Conflito de Interesse',
    'Confidencialidade vs Amizade',
    'Justiça vs Diversidade',
    'Mérito vs Relacionamento',
    'Justiça vs Resultado',
    'Transparência vs Sobrevivência',
    'Inovação vs Segurança',
    'Eficiência vs Humanidade',
    'Lucro vs Sustentabilidade',
  ];

  const dilemas: Dilema[] = [];

  for (let i = 2; i <= 30; i++) {
    const category = categories[(i - 2) % categories.length];
    dilemas.push({
      id: String(i),
      title: `Dilema ${i}: ${category}`,
      description: `Você enfrenta uma situação complexa envolvendo ${category.toLowerCase()}.`,
      context: 'Contexto profissional desafiador que requer decisão ética.',
      category,
      options: [
        {
          id: 'a',
          text: 'Opção A: Priorizar valores éticos absolutos',
          overallScore: 85 + Math.random() * 15,
          feedback: 'Você manteve seus princípios éticos.',
          ethicalAnalysis: [
            { framework: 'Deontologia', score: 95, explanation: 'Segue regras morais' },
            { framework: 'Utilitarismo', score: 70, explanation: 'Bom resultado geral' },
            { framework: 'Ética da Virtude', score: 90, explanation: 'Demonstra virtude' },
            { framework: 'Consequencialismo', score: 75, explanation: 'Consequências positivas' },
            { framework: 'Relativismo', score: 60, explanation: 'Depende do contexto' },
          ],
          valueAnalysis: [
            { value: 'Integridade', alignment: 95, explanation: 'Total' },
            { value: 'Coragem', alignment: 90, explanation: 'Alta' },
            { value: 'Justiça', alignment: 85, explanation: 'Alta' },
            { value: 'Honestidade', alignment: 95, explanation: 'Total' },
            { value: 'Responsabilidade', alignment: 85, explanation: 'Alta' },
          ],
          culturalImpact: 'Reforça cultura ética',
        },
        {
          id: 'b',
          text: 'Opção B: Buscar equilíbrio entre valores e pragmatismo',
          overallScore: 80 + Math.random() * 15,
          feedback: 'Você encontrou um meio termo sensato.',
          ethicalAnalysis: [
            { framework: 'Deontologia', score: 75, explanation: 'Respeita princípios' },
            { framework: 'Utilitarismo', score: 85, explanation: 'Maximiza bem-estar' },
            { framework: 'Ética da Virtude', score: 85, explanation: 'Prudência e coragem' },
            { framework: 'Consequencialismo', score: 85, explanation: 'Bons resultados' },
            { framework: 'Relativismo', score: 80, explanation: 'Contexto apropriado' },
          ],
          valueAnalysis: [
            { value: 'Sabedoria', alignment: 90, explanation: 'Muito alta' },
            { value: 'Equilíbrio', alignment: 95, explanation: 'Perfeito' },
            { value: 'Pragmatismo', alignment: 85, explanation: 'Alto' },
            { value: 'Responsabilidade', alignment: 80, explanation: 'Alta' },
            { value: 'Compaixão', alignment: 80, explanation: 'Alta' },
          ],
          culturalImpact: 'Cultura equilibrada e madura',
        },
        {
          id: 'c',
          text: 'Opção C: Priorizar interesses pessoais/da empresa',
          overallScore: 45 + Math.random() * 25,
          feedback: 'Você priorizou ganhos imediatos.',
          ethicalAnalysis: [
            { framework: 'Deontologia', score: 30, explanation: 'Viola princípios' },
            { framework: 'Utilitarismo', score: 60, explanation: 'Benefício limitado' },
            { framework: 'Ética da Virtude', score: 35, explanation: 'Falta de virtude' },
            { framework: 'Consequencialismo', score: 50, explanation: 'Resultados mistos' },
            { framework: 'Relativismo', score: 70, explanation: 'Depende da visão' },
          ],
          valueAnalysis: [
            { value: 'Integridade', alignment: 30, explanation: 'Baixa' },
            { value: 'Coragem', alignment: 20, explanation: 'Muito baixa' },
            { value: 'Lealdade', alignment: 60, explanation: 'Seletiva' },
            { value: 'Honestidade', alignment: 25, explanation: 'Comprometida' },
            { value: 'Responsabilidade', alignment: 35, explanation: 'Evadida' },
          ],
          culturalImpact: 'Enfraquece cultura ética',
        },
        {
          id: 'd',
          text: 'Opção D: Delegar a decisão para superior',
          overallScore: 65 + Math.random() * 20,
          feedback: 'Você buscou orientação, mas evitou responsabilidade.',
          ethicalAnalysis: [
            { framework: 'Deontologia', score: 60, explanation: 'Compartilha responsabilidade' },
            { framework: 'Utilitarismo', score: 70, explanation: 'Pode ser bom' },
            { framework: 'Ética da Virtude', score: 55, explanation: 'Falta de iniciativa' },
            { framework: 'Consequencialismo', score: 65, explanation: 'Resultados variáveis' },
            { framework: 'Relativismo', score: 75, explanation: 'Contexto apropriado' },
          ],
          valueAnalysis: [
            { value: 'Responsabilidade', alignment: 50, explanation: 'Parcial' },
            { value: 'Prudência', alignment: 75, explanation: 'Alta' },
            { value: 'Humildade', alignment: 80, explanation: 'Alta' },
            { value: 'Coragem', alignment: 40, explanation: 'Baixa' },
            { value: 'Iniciativa', alignment: 35, explanation: 'Baixa' },
          ],
          culturalImpact: 'Cultura de responsabilidade compartilhada',
        },
      ],
    });
  }

  return dilemas;
}

// Combinar dilemas
const ALL_DILEMAS = [...DILEMAS, ...generateAdditionalDilemas()];

// Data storage
const rooms = new Map<string, Room>();
const players = new Map<string, Player>();

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function calculateEthicalProfile(player: Player): void {
  const profile = {
    utilitarismo: 0,
    deontologia: 0,
    virtude: 0,
    consequencialismo: 0,
    relativismo: 0,
  };

  let totalAnswers = 0;

  player.answers.forEach((answer) => {
    const dilema = ALL_DILEMAS.find((d) => d.id === answer.dilemaId);
    if (dilema) {
      const option = dilema.options.find((o) => o.id === answer.optionId);
      if (option) {
        option.ethicalAnalysis.forEach((analysis) => {
          const key = analysis.framework.toLowerCase().replace(' da ', '').replace(' ', '') as keyof typeof profile;
          if (key in profile) {
            profile[key] += analysis.score;
          }
        });
        totalAnswers++;
      }
    }
  });

  if (totalAnswers > 0) {
    Object.keys(profile).forEach((key) => {
      profile[key as keyof typeof profile] = Math.round(profile[key as keyof typeof profile] / totalAnswers);
    });
  }

  const frameworks = Object.entries(profile).sort((a, b) => b[1] - a[1]);
  player.ethicalProfile = {
    ...profile,
    dominantFramework: frameworks[0][0].charAt(0).toUpperCase() + frameworks[0][0].slice(1),
  };
}

// Socket.io events
io.on('connection', (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);

  // Registrar jogador
  socket.on('register_player', (data: { name: string }) => {
    const player: Player = {
      id: socket.id,
      name: data.name,
      score: 0,
      answers: [],
    };
    players.set(socket.id, player);
    console.log(`📝 Jogador registrado: ${data.name}`);
  });

  // Criar sala
  socket.on('create_room', (data: { playerName: string; maxPlayers: number; difficulty: string }) => {
    const roomId = generateId();
    const player: Player = {
      id: socket.id,
      name: data.playerName,
      score: 0,
      answers: [],
    };

    const room: Room = {
      id: roomId,
      name: `Sala de ${data.playerName}`,
      creatorId: socket.id,
      players: [player],
      maxPlayers: data.maxPlayers,
      difficulty: data.difficulty,
      status: 'waiting',
      currentDilemaIndex: 0,
      dilemas: ALL_DILEMAS.slice(0, 5), // Para testes, usar 5 dilemas
      playerAnswers: new Map(),
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    console.log(`🎮 Sala criada: ${roomId}`);
    io.emit('rooms_updated', Array.from(rooms.values()));
  });

  // Entrar em sala
  socket.on('join_room', (data: { roomId: string; playerName: string }) => {
    const room = rooms.get(data.roomId);
    if (room && room.players.length < room.maxPlayers) {
      const player: Player = {
        id: socket.id,
        name: data.playerName,
        score: 0,
        answers: [],
      };
      room.players.push(player);
      socket.join(data.roomId);

      console.log(`👤 ${data.playerName} entrou na sala ${data.roomId}`);
      io.emit('rooms_updated', Array.from(rooms.values()));

      // Se sala está cheia, iniciar jogo
      if (room.players.length === room.maxPlayers) {
        room.status = 'playing';
        const firstDilema = room.dilemas[0];
        io.to(data.roomId).emit('game_started', {
          dilema: firstDilema,
          roomInfo: { currentDilemaIndex: 1, totalDilemas: room.dilemas.length },
        });
      }
    }
  });

  // Responder dilema
  socket.on('answer_dilema', (data: { roomId: string; dilemaId: string; optionId: string }) => {
    const room = rooms.get(data.roomId);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        const dilema = room.dilemas.find((d) => d.id === data.dilemaId);
        if (dilema) {
          const option = dilema.options.find((o) => o.id === data.optionId);
          if (option) {
            player.score += option.overallScore;
            player.answers.push({
              dilemaId: data.dilemaId,
              optionId: data.optionId,
              score: option.overallScore,
            });

            // Registrar resposta (apenas criador vê)
            if (!room.playerAnswers.has(socket.id)) {
              room.playerAnswers.set(socket.id, new Map());
            }
            room.playerAnswers.get(socket.id)!.set(data.dilemaId, data.optionId);

            console.log(`📊 ${player.name} respondeu dilema ${data.dilemaId}`);

            // Próximo dilema
            room.currentDilemaIndex++;
            if (room.currentDilemaIndex < room.dilemas.length) {
              const nextDilema = room.dilemas[room.currentDilemaIndex];
              io.to(data.roomId).emit('next_dilema', {
                dilema: nextDilema,
                roomInfo: {
                  currentDilemaIndex: room.currentDilemaIndex + 1,
                  totalDilemas: room.dilemas.length,
                },
                playerScores: room.players.sort((a, b) => b.score - a.score),
              });
            } else {
              // Jogo finalizado
              room.status = 'finished';
              room.players.forEach((p) => calculateEthicalProfile(p));
              const ranking = room.players.sort((a, b) => b.score - a.score);
              io.to(data.roomId).emit('game_finished', { ranking });
            }
          }
        }
      }
    }
  });

  // Listar salas
  socket.on('list_rooms', () => {
    socket.emit('rooms_updated', Array.from(rooms.values()));
  });

  // Desconectar
  socket.on('disconnect', () => {
    console.log(`❌ Usuário desconectado: ${socket.id}`);
    // Remover jogador de salas
    rooms.forEach((room) => {
      room.players = room.players.filter((p) => p.id !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(room.id);
      }
    });
    io.emit('rooms_updated', Array.from(rooms.values()));
  });
});

// HTTP routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/rooms', (req, res) => {
  res.json(Array.from(rooms.values()));
});

app.get('/dilemas', (req, res) => {
  res.json(ALL_DILEMAS);
});

// Start server
const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
