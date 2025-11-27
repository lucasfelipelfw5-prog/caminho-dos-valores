import { Dilema } from '../types/types.js';

// 30 Dilemas com análise ética
const DILEMAS_DATA: Dilema[] = [
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
            { value: 'Lucro', alignment: 90, explanation: 'Alto' },
            { value: 'Eficiência', alignment: 85, explanation: 'Alto' },
            { value: 'Integridade', alignment: 20, explanation: 'Baixa' },
            { value: 'Transparência', alignment: 10, explanation: 'Muito baixa' },
            { value: 'Justiça', alignment: 30, explanation: 'Baixa' },
          ],
          culturalImpact: 'Cultura de resultados a qualquer custo',
        },
      ],
    });
  }
  return dilemas;
}

export const ALL_DILEMAS: Dilema[] = [...DILEMAS_DATA, ...generateAdditionalDilemas()];
