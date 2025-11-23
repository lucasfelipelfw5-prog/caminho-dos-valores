import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import http from 'http';

// -------------------------------------------------------------------
// TIPAGENS (copia isso exatamente como está)
interface Efeito {
  valor: 'honestidade' | 'empatia' | 'coragem' | 'pragmatismo';
  delta: number;
}

interface Dilema {
  id: string;
  texto: string;
  escolhas: string[];
  efeitos: Efeito[][];
}

interface Valores {
  honestidade: number;
  empatia: number;
  coragem: number;
  pragmatismo: number;
}

interface Jogador {
  id: string;
  nome: string;
  valores: Valores;
  posicao: number;
}

interface Sala {
  salaId: string;
  jogadores: Jogador[];
  dilemaAtualId: string;
  fim: boolean;
  turnoAtual: string;
}

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// -------------------------------------------------------------------
const dilemas: Dilema[] = [
  {
    id: "d1",
    texto: "Você encontra uma carteira com R$ 800 e documentos na rua. O que faz?",
    escolhas: ["Procura o dono imediatamente", "Fica com o dinheiro e joga os documentos fora"],
    efeitos: [[{ valor: "honestidade", delta: 6 }], [{ valor: "pragmatismo", delta: 6 }, { valor: "honestidade", delta: -5 }]]
  },
  {
    id: "d2",
    texto: "Seu chefe pede pra você mentir pro cliente dizendo que o projeto está no prazo (quando não está).",
    escolhas: ["Fala a verdade pro cliente", "Segue a ordem do chefe"],
    efeitos: [[{ valor: "honestidade", delta: 5 }, { valor: "coragem", delta: 4 }], [{ valor: "pragmatismo", delta: 5 }, { valor: "honestidade", delta: -4 }]]
  },
  {
    id: "d3",
    texto: "Um colega está sendo injustiçado no trabalho e ninguém fala nada.",
    escolhas: ["Defende ele na frente de todo mundo", "Fica quieto pra não se queimar"],
    efeitos: [[{ valor: "coragem", delta: 7 }, { valor: "empatia", delta: 4 }], [{ valor: "pragmatismo", delta: 4 }, { valor: "coragem", delta: -5 }]]
  },
  {
    id: "d4",
    texto: "Você descobre que pode ganhar muito dinheiro com um produto que polui um pouco o meio ambiente.",
    escolhas: ["Lança o produto mesmo assim", "Desiste do lucro e escolhe uma opção ecológica"],
    efeitos: [[{ valor: "pragmatismo", delta: 7 }], [{ valor: "empatia", delta: 6 }, { valor: "pragmatismo", delta: -5 }]]
  },
  {
    id: "d5",
    texto: "Seu melhor amigo te pergunta se a roupa dele está boa (e está horrível).",
    escolhas: ["Diz a verdade na lata", "Mente pra não magoar"],
    efeitos: [[{ valor: "honestidade", delta: 5 }], [{ valor: "empatia", delta: 6 }, { valor: "honestidade", delta: -4 }]]
  },
  {
    id: "d6",
    texto: "Você vê um estranho sendo assaltado na rua à noite.",
    escolhas: ["Intervém mesmo correndo risco", "Liga pra polícia e fica de longe"],
    efeitos: [[{ valor: "coragem", delta: 8 }, { valor: "empatia", delta: 5 }], [{ valor: "pragmatismo", delta: 5 }, { valor: "coragem", delta: -6 }]]
  },
  {
    id: "d7",
    texto: "Você pode copiar no vestibular e garantir a vaga dos sonhos.",
    escolhas: ["Copia escondido", "Faz a prova limpo"],
    efeitos: [[{ valor: "pragmatismo", delta: 7 }, { valor: "honestidade", delta: -7 }], [{ valor: "honestidade", delta: 8 }]]
  },
  {
    id: "d8",
    texto: "Você comete um erro grave no trabalho que pode ser escondido facilmente.",
    escolhas: ["Assume o erro na hora", "Esconde e reza pra ninguém descobrir"],
    efeitos: [[{ valor: "honestidade", delta: 7 }, { valor: "coragem", delta: 5 }], [{ valor: "pragmatismo", delta: 7 }, { valor: "honestidade", delta: -6 }]]
  },
  {
    id: "d9",
    texto: "Você tem dinheiro pra ajudar só uma causa: uma criança doente ou uma ONG grande de impacto.",
    escolhas: ["Ajuda a criança (impacto emocional)", "Doa pra ONG (maior alcance)"],
    efeitos: [[{ valor: "empatia", delta: 8 }], [{ valor: "pragmatismo", delta: 7 }]]
  },
  {
    id: "d10",
    texto: "Você descobre um furo no sistema da empresa que te daria aumento automático.",
    escolhas: ["Explora o furo", "Reporta pro RH"],
    efeitos: [[{ valor: "pragmatismo", delta: 8 }, { valor: "honestidade", delta: -7 }], [{ valor: "honestidade", delta: 8 }, { valor: "coragem", delta: 4 }]]
  },
  {
    id: "d11",
    texto: "Seu parceiro te traiu, mas tá arrependido e quer voltar.",
    escolhas: ["Dá uma segunda chance", "Termina de vez"],
    efeitos: [[{ valor: "empatia", delta: 7 }, { valor: "pragmatismo", delta: -4 }], [{ valor: "pragmatismo", delta: 6 }]]
  },
  {
    id: "d12",
    texto: "Você pode vazar um áudio do seu chefe falando mal da empresa e ser promovido no caos.",
    escolhas: ["Vaza o áudio", "Guarda e ignora"],
    efeitos: [[{ valor: "pragmatismo", delta: 9 }, { valor: "honestidade", delta: -8 }], [{ valor: "honestidade", delta: 7 }]]
  },
  {
    id: "d13",
    texto: "Você tem chance de entrar num esquema de pirâmide que tá dando muito dinheiro pra todo mundo que você conhece.",
    escolhas: ["Entra no esquema", "Fica de fora mesmo vendo os outros enriquecerem"],
    efeitos: [[{ valor: "pragmatismo", delta: 10 }], [{ valor: "honestidade", delta: 6 }, { valor: "coragem", delta: 5 }]]
  },
  {
    id: "d14",
    texto: "Você flagra seu filho mentindo pra você sobre algo sério.",
    escolhas: ["Castiga forte pra ele aprender", "Conversar com empatia e entender o motivo"],
    efeitos: [[{ valor: "honestidade", delta: 5 }, { valor: "pragmatismo", delta: 5 }], [{ valor: "empatia", delta: 9 }]]
  },
  {
    id: "d15",
    texto: "Última pergunta: você chegaria até aqui se ninguém estivesse vendo?",
    escolhas: ["Sim, faço o certo mesmo sozinho", "Só faço o certo quando tem plateia"],
    efeitos: [[{ valor: "honestidade", delta: 10 }, { valor: "coragem", delta: 8 }], [{ valor: "pragmatismo", delta: 8 }]]
  }
];

interface Session {
  salaId: string;
  jogadores: { id: string; nome: string; valores: Valores; posicao: number; }[];
  dilemaAtualId: string;
  fim: boolean;
  turnoAtual: string; // ID do jogador da vez
}

const salas: Record<string, Sala> = {};
// Socket.io
io.on('connection', (socket: Socket) => {
  console.log('Jogador conectado:', socket.id);

  socket.on('criar-sala', (nome: string) => {
    const salaId = uuidv4().slice(0, 8);
    salas[salaId] = {
      salaId,
      jogadores: [{ id: socket.id, nome, valores: { honestidade: 0, empatia: 0, coragem: 0, pragmatismo: 0 }, posicao: 0 }],
      dilemaAtualId: dilemas[0].id,
      fim: false,
      turnoAtual: socket.id
    };
    socket.join(salaId);
    socket.emit('sala-criada', salaId);
    io.to(salaId).emit('jogadores-atualizados', salas[salaId].jogadores);
  });

  socket.on('entrar-sala', ({ salaId, nome }: { salaId: string; nome: string }) => {
    const sala = salas[salaId];
    if (!sala || sala.jogadores.length >= 4) {
      socket.emit('erro-sala', 'Sala cheia ou não existe');
      return;
    }
    sala.jogadores.push({ id: socket.id, nome, valores: { honestidade: 0, empatia: 0, coragem: 0, pragmatismo: 0 }, posicao: 0 });
    socket.join(salaId);
    io.to(salaId).emit('jogadores-atualizados', sala.jogadores);
    socket.emit('entrou-sala', sala);
  });

  socket.on('escolha', ({ salaId, escolhaIndex }: { salaId: string; escolhaIndex: number }) => {
    const sala = salas[salaId];
    if (!sala || socket.id !== sala.turnoAtual) return;

    const jogador = sala.jogadores.find(j => j.id === socket.id);
    if (!jogador) return;

    // Aplicar efeito do dilema
    const dilema = dilemas.find(d => d.id === sala.dilemaAtualId);
    if (dilema && dilema.efeitos[escolhaIndex]) {
      dilema.efeitos[escolhaIndex].forEach(efeito => {
        jogador.valores[efeito.valor] += efeito.delta;
      });
    }

    // Avança posição no mapa
    jogador.posicao += 1;

    // Próximo dilema / turno
    if (jogador.posicao < dilemas.length) {
      sala.dilemaAtualId = dilemas[jogador.posicao].id;
      const proximoJogador = sala.jogadores[(sala.jogadores.indexOf(jogador) + 1) % sala.jogadores.length];
      sala.turnoAtual = proximoJogador.id;
    } else {
      sala.fim = true;
    }

    io.to(salaId).emit('estado-atualizado', sala);
  });

  socket.on('disconnect', () => {
    // Remove jogador de salas
    for (const salaId in salas) {
      const sala = salas[salaId];
      sala.jogadores = sala.jogadores.filter(j => j.id !== socket.id);
      if (sala.jogadores.length === 0) delete salas[salaId];
      else io.to(salaId).emit('jogadores-atualizados', sala.jogadores);
    }
  });
});

// API tradicional (fallback)
app.get('/api/game/start', (req, res) => { /* seu código antigo para single-player */ });
app.post('/api/game/session/:sessionId/choice', (req, res) => { /* seu código antigo */ });

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
