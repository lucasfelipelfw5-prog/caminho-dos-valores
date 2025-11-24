import React, { useState, useEffect } from 'react';

type Screen = 'splash' | 'menu' | 'game' | 'analysis' | 'end';

interface Option {
  id: string;
  text: string;
  feedback: string;
  overallScore: number;
  ethicalAnalysis: { framework: string; score: number; explanation: string }[];
  valueAnalysis: { value: string; alignment: number; explanation: string }[];
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

const DILEMAS: Dilema[] = [
  { id: "1", title: "O E-mail Enganoso", description: "Colega enviou dados falsos para cliente VIP fechar contrato de R$ 2 mi. Cliente já assinou.", context: "Empresa ia demitir 40 pessoas. Contrato salvou todos os empregos.", category: "Integridade", options: [
    { id: "a", text: "Denunciar imediatamente ao cliente e diretoria", overallScore: 94, feedback: "Você priorizou a verdade absoluta, mesmo com alto custo humano.", ethicalAnalysis: [{framework:"Deontologia",score:100,explanation:"Mentir é sempre errado"},{framework:"Utilitarismo",score:30,explanation:"Causa demissões em massa"},{framework:"Ética da Virtude",score:95,explanation:"Coragem exemplar"}], valueAnalysis: [{value:"Integridade",alignment:100,explanation:"Total"},{value:"Responsabilidade Social",alignment:20,explanation:"Prejudica inocentes"}], culturalImpact: "Crise interna grave" },
    { id: "b", text: "Dar 48h pro colega corrigir sozinho", overallScore: 88, feedback: "Abordagem restaurativa com menor dano.", ethicalAnalysis: [{framework:"Deontologia",score:70,explanation:"Adia a verdade"},{framework:"Utilitarismo",score:92,explanation:"Maximiza bem-estar"}], valueAnalysis: [{value:"Integridade",alignment:85,explanation:"Com reparação"},{value:"Empatia",alignment:95,explanation:"Considera pessoas"}], culturalImpact: "Preserva clima com chance de correção" },
    { id: "c", text: "Ignorar e fingir que não viu", overallScore: 32, feedback: "Você comprometeu valores essenciais.", ethicalAnalysis: [{framework:"Deontologia",score:10,explanation:"Viola dever de honestidade"}], valueAnalysis: [{value:"Integridade",alignment:10,explanation:"Grave violação"}], culturalImpact: "Normaliza desvios éticos" },
    { id: "d", text: "Informar só internamente e monitorar", overallScore: 78, feedback: "Protegeu empresa, mas deixou cliente no escuro.", ethicalAnalysis: [{framework:"Deontologia",score:45,explanation:"Engana cliente"}], valueAnalysis: [{value:"Lealdade Interna",alignment:90,explanation:"Protege time"}], culturalImpact: "Cultura de segredos" }
  ]},
  { id: "2", title: "Pressão do Chefe", description: "Chefe pede pra assinar relatório com erros graves.", context: "Recusar pode custar bônus ou emprego.", category: "Obediência vs Consciência", options: [
    { id: "a", text: "Assinar mesmo sabendo do erro", overallScore: 28, feedback: "Priorizou carreira em detrimento da responsabilidade.", ethicalAnalysis: [{framework:"Deontologia",score:15,explanation:"Viola dever profissional"}], valueAnalysis: [{value:"Coragem",alignment:10,explanation:"Falta total"}], culturalImpact: "Cultura do medo" },
    { id: "b", text: "Recusar e explicar por escrito", overallScore: 96, feedback: "Demonstrou coragem e responsabilidade.", ethicalAnalysis: [{framework:"Deontologia",score:100,explanation:"Cumpre dever"}], valueAnalysis: [{value:"Coragem",alignment:100,explanation:"Exemplar"}], culturalImpact: "Cultura de transparência" },
    { id: "c", text: "Assinar mas avisar por e-mail paralelo", overallScore: 72, feedback: "Se protegeu, mas contribuiu com erro.", ethicalAnalysis: [{framework:"Deontologia",score:60,explanation:"Meio termo arriscado"}], valueAnalysis: [{value:"Prudência",alignment:85,explanation:"CYA"}], culturalImpact: "Cultura de se proteger" },
    { id: "d", text: "Conversar e propor correção conjunta", overallScore: 90, feedback: "Melhor equilíbrio coragem + relação.", ethicalAnalysis: [{framework:"Utilitarismo",score:92,explanation:"Melhor resultado"}], valueAnalysis: [{value:"Respeito",alignment:95,explanation:"Mantém relação"}], culturalImpact: "Cultura colaborativa" }
  ]},
  { id: "3", title: "Presente do Fornecedor", description: "Fornecedor oferece viagem de fim de semana tudo pago.", context: "Política da empresa proíbe presentes > R$ 200.", category: "Conflito de Interesse", options: [
    { id: "a", text: "Aceitar a viagem", overallScore: 25, feedback: "Comprometeu imparcialidade.", ethicalAnalysis: [{framework:"Deontologia",score:10,explanation:"Viola regra clara"}], valueAnalysis: [{value:"Imparcialidade",alignment:5,explanation:"Totalmente comprometida"}], culturalImpact: "Cultura de favores" },
    { id: "b", text: "Recusar educadamente", overallScore: 98, feedback: "Manteve integridade total.", ethicalAnalysis: [{framework:"Deontologia",score:100,explanation:"Cumpre regra"}], valueAnalysis: [{value:"Integridade",alignment:100,explanation:"Exemplar"}], culturalImpact: "Cultura ética forte" },
    { id: "c", text: "Aceitar mas pagar do próprio bolso", overallScore: 85, feedback: "Boa intenção, mas ainda cria vínculo.", ethicalAnalysis: [{framework:"Utilitarismo",score:80,explanation:"Evita corrupção direta"}], valueAnalysis: [{value:"Transparência",alignment:70,explanation:"Parcial"}], culturalImpact: "Área cinza" },
    { id: "d", text: "Reportar ao compliance", overallScore: 95, feedback: "Protegeu empresa e si mesmo.", ethicalAnalysis: [{framework:"Deontologia",score:98,explanation:"Cumpre dever de reporte"}], valueAnalysis: [{value:"Responsabilidade",alignment:100,explanation:"Total"}], culturalImpact: "Cultura de compliance forte" }
  ]},
  { id: "4", title: "Furo de Confidencialidade", description: "Você ouve por acidente que vai ter demissão em massa na sexta.", context: "Amigos seus trabalham na área afetada.", category: "Confidencialidade vs Amizade", options: [
    { id: "a", text: "Avisar os amigos imediatamente", overallScore: 42, feedback: "Quebrou confidencialidade.", ethicalAnalysis: [{framework:"Deontologia",score:20,explanation:"Viola sigilo"}], valueAnalysis: [{value:"Lealdade",alignment:95,explanation:"Com amigos"}], culturalImpact: "Quebra de confiança na empresa" },
    { id: "b", text: "Não avisar ninguém", overallScore: 92, feedback: "Manteve sigilo total.", ethicalAnalysis: [{framework:"Deontologia",score:100,explanation:"Cumpre dever"}], valueAnalysis: [{value:"Confidencialidade",alignment:100,explanation:"Total"}], culturalImpact: "Cultura profissional" },
    { id: "c", text: "Avisar de forma anônima", overallScore: 68, feedback: "Tentou ajudar sem se expor.", ethicalAnalysis: [{framework:"Utilitarismo",score:85,explanation:"Ajuda pessoas"}], valueAnalysis: [{value:"Coragem",alignment:60,explanation:"Meio termo"}], culturalImpact: "Risco de investigação" },
    { id: "d", text: "Conversar com RH sobre comunicação mais humana", overallScore: 96, feedback: "Melhor solução ética e empática.", ethicalAnalysis: [{framework:"Ética da Virtude",score:98,explanation:"Compassion + responsabilidade"}], valueAnalysis: [{value:"Empatia",alignment:100,explanation:"Exemplar"}], culturalImpact: "Cultura mais humana" }
  ]},
  { id: "5", title: "Plágio do Estagiário", description: "Estagiário entrega trabalho excelente que você descobre ser 90% copiado.", context: "Ele é o único estagiário negro da equipe e está em avaliação.", category: "Justiça vs Diversidade", options: [
    { id: "a", text: "Reprovar e comunicar plágio", overallScore: 94, feedback: "Manteve padrão acadêmico.", ethicalAnalysis: [{framework:"Deontologia",score:100,explanation:"Plágio é inaceitável"}], valueAnalysis: [{value:"Justiça",alignment:100,explanation:"Igualdade de regras"}], culturalImpact: "Cultura meritocrática" },
    { id: "b", text: "Aprovar e orientar em particular", overallScore: 65, feedback: "Favoreceu pessoa em detrimento da regra.", ethicalAnalysis: [{framework:"Deontologia",score:40,explanation:"Dois pesos"}], valueAnalysis: [{value:"Inclusão",alignment:90,explanation:"Protege diversidade"}], culturalImpact: "Risco de precedente" },
    { id: "c", text: "Dar nota média e não expor", overallScore: 58, feedback: "Meio termo arriscado.", ethicalAnalysis: [{framework:"Utilitarismo",score:70,explanation:"Evita dano"}], valueAnalysis: [{value:"Equilíbrio",alignment:75,explanation:"Tentativa"}], culturalImpact: "Área cinza" },
    { id: "d", text: "Reprovar mas oferecer segunda chance com mentoria", overallScore: 98, feedback: "Justiça + inclusão.", ethicalAnalysis: [{framework:"Ética da Virtude",score:99,explanation:"Justiça com compaixão"}], valueAnalysis: [{value:"Desenvolvimento",alignment:100,explanation:"Ensina sem punir"}], culturalImpact: "Cultura de aprendizado" }
  ]},
   {
    id: "6",
    title: "Nepotismo Discreto",
    description: "O diretor quer contratar o sobrinho sem abrir vaga pública.",
    context: "O sobrinho é realmente qualificado e a vaga existe.",
    category: "Mérito vs Relacionamento",
    options: [
      { id: "a", text: "Aceitar a contratação direta sem processo seletivo", overallScore: 34, feedback: "Você comprometeu a meritocracia em nome do relacionamento.", ethicalAnalysis: [{ framework: "Deontologia", score: 20, explanation: "Viola regra de igualdade" }, { framework: "Utilitarismo", score: 60, explanation: "Pessoa qualificada entra rápido" }], valueAnalysis: [{ value: "Mérito", alignment: 15, explanation: "Muito baixo" }, { value: "Lealdade", alignment: 90, explanation: "Alta com diretoria" }], culturalImpact: "Cultura de favorecimento familiar" },
      { id: "b", text: "Exigir abertura de vaga pública e processo normal", overallScore: 98, feedback: "Defendeu a justiça e a meritocracia total.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Regra é regra" }], valueAnalysis: [{ value: "Justiça", alignment: 100, explanation: "Total" }, { value: "Transparência", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura meritocrática forte" },
      { id: "c", text: "Aceitar, mas abrir vaga simbólica só pra cumprir tabela", overallScore: 58, feedback: "Tentou disfarçar o nepotismo – ainda é nepotismo.", ethicalAnalysis: [{ framework: "Deontologia", score: 45, explanation: "Meio termo falso" }], valueAnalysis: [{ value: "Transparência", alignment: 30, explanation: "Baixa" }], culturalImpact: "Cultura de fachada" },
      { id: "d", text: "Recusar e sugerir outro cargo ou empresa", overallScore: 88, feedback: "Equilíbrio perfeito entre respeito à regra e à relação.", ethicalAnalysis: [{ framework: "Virtude", score: 94, explanation: "Respeito e coragem" }], valueAnalysis: [{ value: "Respeito", alignment: 95, explanation: "Alta" }, { value: "Coragem", alignment: 90, explanation: "Alta" }], culturalImpact: "Cultura ética e respeitosa" }
    ]
  },
  {
    id: "7",
    title: "Assédio Não Denunciado",
    description: "Você presencia assédio verbal grave de um gestor contra uma subordinada.",
    context: "O gestor é o maior vendedor da empresa (30% do faturamento).",
    category: "Justiça vs Resultado",
    options: [
      { id: "a", text: "Não fazer nada pra não prejudicar a empresa", overallScore: 22, feedback: "Priorizou dinheiro sobre pessoas.", ethicalAnalysis: [{ framework: "Deontologia", score: 10, explanation: "Falha grave" }, { framework: "Utilitarismo", score: 70, explanation: "Evita perda financeira" }], valueAnalysis: [{ value: "Respeito", alignment: 5, explanation: "Quase nulo" }], culturalImpact: "Cultura tóxica protegida" },
      { id: "b", text: "Denunciar imediatamente ao RH/Compliance", overallScore: 97, feedback: "Protegeu a vítima e a cultura da empresa.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Dever cumprido" }, { framework: "Virtude", score: 98, explanation: "Coragem moral" }], valueAnalysis: [{ value: "Coragem", alignment: 100, explanation: "Total" }, { value: "Respeito", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura segura e ética" },
      { id: "c", text: "Conversar em particular com o gestor primeiro", overallScore: 82, feedback: "Tentou resolver de forma restaurativa – risco alto.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 88, explanation: "Pode funcionar" }], valueAnalysis: [{ value: "Diálogo", alignment: 95, explanation: "Alta" }], culturalImpact: "Depende do agressor" },
      { id: "d", text: "Apoiar a vítima e sugerir que ela denuncie", overallScore: 90, feedback: "Empoderou a vítima sem se expor demais.", ethicalAnalysis: [{ framework: "Virtude", score: 92, explanation: "Empatia e apoio" }], valueAnalysis: [{ value: "Empatia", alignment: 98, explanation: "Muito alta" }], culturalImpact: "Cultura de apoio às vítimas" }
    ]
  },
  {
    id: "8",
    title: "Dados Manipulados no Dashboard",
    description: "Chefe pede pra você 'ajustar' números do dashboard pra parecer melhor na reunião com investidores.",
    context: "Empresa está em rodada de investimento Série B.",
    category: "Transparência vs Sobrevivência",
    options: [
      { id: "a", text: "Fazer o ajuste solicitado", overallScore: 28, feedback: "Comprometeu integridade por pressão financeira.", ethicalAnalysis: [{ framework: "Deontologia", score: 15, explanation: "Fraude clara" }], valueAnalysis: [{ value: "Integridade", alignment: 10, explanation: "Quase nula" }], culturalImpact: "Cultura de maquiagem de números" },
      { id: "b", text: "Recusar e mostrar os números reais", overallScore: 96, feedback: "Defendeu transparência total.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Honestidade absoluta" }], valueAnalysis: [{ value: "Coragem", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura honesta" },
      { id: "c", text: "Ajustar só um pouco pra 'arredondar'", overallScore: 48, feedback: "Ainda é fraude.", ethicalAnalysis: [{ framework: "Deontologia", score: 40, explanation: "Mentira pequena ainda é mentira" }], valueAnalysis: [{ value: "Integridade", alignment: 35, explanation: "Baixa" }], culturalImpact: "Cultura do jeitinho" },
      { id: "d", text: "Recusar e propor narrativa honesta com plano de recuperação", overallScore: 94, feedback: "Melhor equilíbrio: honestidade + solução.", ethicalAnalysis: [{ framework: "Virtude", score: 96, explanation: "Liderança ética" }], valueAnalysis: [{ value: "Liderança", alignment: 98, explanation: "Muito alta" }], culturalImpact: "Cultura realista e ética" }
    ]
  },
  {
    id: "9",
    title: "Cliente que Paga Propina",
    description: "Cliente importante oferece propina de 10% pra priorizar os pedidos dele.",
    context: "Ele representa 25% da receita da sua área.",
    category: "Integridade vs Resultado",
    options: [
      { id: "a", text: "Aceitar a propina", overallScore: 18, feedback: "Corrupção ativa.", ethicalAnalysis: [{ framework: "Deontologia", score: 5, explanation: "Corrupção explícita" }], valueAnalysis: [{ value: "Integridade", alignment: 5, explanation: "Quase nula" }], culturalImpact: "Cultura corrupta" },
      { id: "b", text: "Recusar e reportar ao compliance", overallScore: 99, feedback: "Reação perfeita.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Dever cumprido" }], valueAnalysis: [{ value: "Integridade", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura anticorrupção" },
      { id: "c", text: "Recusar mas não reportar", overallScore: 78, feedback: "Bom, mas deixou brecha.", ethicalAnalysis: [{ framework: "Deontologia", score: 85, explanation: "Falta o reporte" }], valueAnalysis: [{ value: "Coragem", alignment: 70, explanation: "Parcial" }], culturalImpact: "Risco de recorrência" },
      { id: "d", text: "Aceitar e doar o valor pra instituição", overallScore: 52, feedback: "Tentou lavar a consciência – ainda é propina.", ethicalAnalysis: [{ framework: "Deontologia", score: 30, explanation: "Propina disfarçada" }], valueAnalysis: [{ value: "Integridade", alignment: 25, explanation: "Baixa" }], culturalImpact: "Cultura hipócrita" }
    ]
  },
  {
    id: "10",
    title: "Funcionário com Burnout",
    description: "Seu melhor funcionário está claramente com burnout, mas a entrega do projeto é semana que vem.",
    context: "Se ele parar, o projeto atrasa 1 mês.",
    category: "Resultado vs Saúde",
    options: [
      { id: "a", text: "Cobrar entrega normal", overallScore: 35, feedback: "Priorizou prazo sobre pessoa.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 75, explanation: "Entrega no prazo" }, { framework: "Virtude", score: 20, explanation: "Falta empatia" }], valueAnalysis: [{ value: "Cuidado", alignment: 15, explanation: "Muito baixo" }], culturalImpact: "Cultura do esgotamento" },
      { id: "b", text: "Dar folga imediata e realocar equipe", overallScore: 95, feedback: "Priorizou saúde – melhor líder.", ethicalAnalysis: [{ framework: "Virtude", score: 98, explanation: "Empatia e responsabilidade" }], valueAnalysis: [{ value: "Empatia", alignment: 100, explanation: "Total" }, { value: "Liderança", alignment: 95, explanation: "Muito alta" }], culturalImpact: "Cultura saudável" },
      { id: "c", text: "Dar 2 dias de folga e cobrar depois", overallScore: 72, feedback: "Meio termo – pode não ser suficiente.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 80, explanation: "Tentativa de equilíbrio" }], valueAnalysis: [{ value: "Equilíbrio", alignment: 75, explanation: "Razoável" }], culturalImpact: "Cultura de remendo" },
      { id: "d", text: "Conversar, reduzir carga e estender prazo internamente", overallScore: 98, feedback: "Melhor solução humana e realista.", ethicalAnalysis: [{ framework: "Virtude", score: 99, explanation: "Liderança exemplar" }], valueAnalysis: [{ value: "Responsabilidade", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura sustentável" }
    ]
  },
   {
    id: "11",
    title: "Demissão por WhatsApp",
    description: "O RH quer demitir um funcionário de 12 anos de casa por mensagem de WhatsApp.",
    context: "Ele está de atestado médico há 15 dias (depressão).",
    category: "Respeito vs Praticidade",
    options: [
      { id: "a", text: "Aprovar a demissão por WhatsApp", overallScore: 18, feedback: "Falta de humanidade total.", ethicalAnalysis: [{ framework: "Virtude", score: 10, explanation: "Desrespeito extremo à dignidade" }], valueAnalysis: [{ value: "Respeito", alignment: 5, explanation: "Quase inexistente" }], culturalImpact: "Cultura fria e desumana" },
      { id: "b", text: "Exigir demissão presencial com acompanhante", overallScore: 98, feedback: "Defendeu dignidade da pessoa.", ethicalAnalysis: [{ framework: "Virtude", score: 99, explanation: "Empatia e respeito máximo" }], valueAnalysis: [{ value: "Humanidade", alignment: 100, explanation: "Prioriza a pessoa" }, { value: "Coragem", alignment: 95, explanation: "Enfrenta o RH" }], culturalImpact: "Cultura respeitosa" },
      { id: "c", text: "Aceitar por vídeo-chamada", overallScore: 68, feedback: "Melhor que WhatsApp, mas ainda frio.", ethicalAnalysis: [{ framework: "Virtude", score: 70, explanation: "Melhor que texto, mas impessoal" }], valueAnalysis: [{ value: "Respeito", alignment: 65, explanation: "Parcial" }], culturalImpact: "Cultura intermediária" },
      { id: "d", text: "Sugerir licença médica prolongada antes da demissão", overallScore: 92, feedback: "Mostrou cuidado com a saúde mental.", ethicalAnalysis: [{ framework: "Virtude", score: 96, explanation: "Prioriza saúde antes de tudo" }], valueAnalysis: [{ value: "Empatia", alignment: 98, explanation: "Muito alta" }], culturalImpact: "Cultura que cuida das pessoas" }
    ]
  },
  {
    id: "12",
    title: "Cliente Racista",
    description: "Um cliente importante faz comentários racistas na frente da equipe.",
    context: "Ele representa 20% da receita anual.",
    category: "Lucro vs Dignidade",
    options: [
      { id: "a", text: "Ignorar pra não perder o cliente", overallScore: 15, feedback: "Tolerou racismo por dinheiro.", ethicalAnalysis: [{ framework: "Deontologia", score: 10, explanation: "Viola princípio básico de respeito" }], valueAnalysis: [{ value: "Respeito", alignment: 5, explanation: "Quase nulo" }], culturalImpact: "Cultura racista tolerada" },
      { id: "b", text: "Cancelar o contrato imediatamente", overallScore: 97, feedback: "Defendeu valores acima do lucro.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Não se negocia dignidade" }], valueAnalysis: [{ value: "Dignidade", alignment: 100, explanation: "Inabalável" }, { value: "Coragem", alignment: 98, explanation: "Enfrenta perda financeira" }], culturalImpact: "Cultura inclusiva forte" },
      { id: "c", text: "Fazer advertência privada e continuar", overallScore: 78, feedback: "Tentou equilibrar, mas ainda mantém relacionamento tóxico.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 80, explanation: "Evita perda imediata" }], valueAnalysis: [{ value: "Tolerância", alignment: 60, explanation: "Aceita comportamento tóxico" }], culturalImpact: "Cultura de silêncio" },
      { id: "d", text: "Chamar atenção na hora e dar ultimato", overallScore: 94, feedback: "Coragem imediata com chance de correção.", ethicalAnalysis: [{ framework: "Virtude", score: 96, explanation: "Coragem moral pública" }], valueAnalysis: [{ value: "Coragem", alignment: 98, explanation: "Age na hora" }], culturalImpact: "Cultura de zero tolerância" }
    ]
  },
  {
    id: "13",
    title: "Grávida na Reforma",
    description: "Você precisa cortar 3 pessoas. Uma delas está grávida de 7 meses.",
    context: "Ela tem o pior desempenho do time nos últimos 6 meses.",
    category: "Desempenho vs Proteção",
    options: [
      { id: "a", text: "Demitir mesmo estando grávida", overallScore: 72, feedback: "Priorizou desempenho, mas dentro da lei.", ethicalAnalysis: [{ framework: "Deontologia", score: 90, explanation: "Estabilidade só após confirmação" }], valueAnalysis: [{ value: "Justiça", alignment: 95, explanation: "Baseada em desempenho" }], culturalImpact: "Cultura meritocrática fria" },
      { id: "b", text: "Manter ela e demitir outro", overallScore: 58, feedback: "Protegeu a grávida, mas injusto com outro colega.", ethicalAnalysis: [{ framework: "Virtude", score: 75, explanation: "Proteção materna" }], valueAnalysis: [{ value: "Empatia", alignment: 90, explanation: "Com a grávida" }, { value: "Justiça", alignment: 40, explanation: "Injusto com outro" }], culturalImpact: "Cultura de proteção excessiva" },
      { id: "c", text: "Criar PIP e adiar a decisão", overallScore: 88, feedback: "Justiça com humanidade.", ethicalAnalysis: [{ framework: "Virtude", score: 92, explanation: "Dá chance real" }], valueAnalysis: [{ value: "Equilíbrio", alignment: 95, explanation: "Justo e humano" }], culturalImpact: "Cultura justa e humana" },
      { id: "d", text: "Demitir e oferecer pacote extra", overallScore: 85, feedback: "Justo e com cuidado.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 88, explanation: "Minimiza dano" }], valueAnalysis: [{ value: "Responsabilidade", alignment: 90, explanation: "Cuida da transição" }], culturalImpact: "Cultura equilibrada" }
    ]
  },
  {
    id: "14",
    title: "Foto no Banheiro",
    description: "Um funcionário tirou foto no banheiro da empresa e postou no Instagram Stories com legenda debochada.",
    context: "A foto não mostra ninguém, mas é claramente o banheiro da empresa.",
    category: "Liberdade vs Imagem",
    options: [
      { id: "a", text: "Demitir por justa causa", overallScore: 42, feedback: "Reação exagerada.", ethicalAnalysis: [{ framework: "Deontologia", score: 60, explanation: "Pode ser desproporcional" }], valueAnalysis: [{ value: "Proporcionalidade", alignment: 30, explanation: "Exagerada" }], culturalImpact: "Cultura repressora" },
      { id: "b", text: "Apenas advertir verbalmente", overallScore: 92, feedback: "Resposta proporcional e educativa.", ethicalAnalysis: [{ framework: "Virtude", score: 94, explanation: "Bom senso e diálogo" }], valueAnalysis: [{ value: "Bom senso", alignment: 98, explanation: "Adequado" }], culturalImpact: "Cultura adulta" },
      { id: "c", text: "Ignorar completamente", overallScore: 68, feedback: "Pode incentivar mais posts.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 70, explanation: "Evita conflito" }], valueAnalysis: [{ value: "Controle", alignment: 50, explanation: "Baixo" }], culturalImpact: "Cultura sem limites" },
      { id: "d", text: "Bloquear redes sociais no Wi-Fi", overallScore: 55, feedback: "Solução técnica desnecessária.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 65, explanation: "Resolve, mas cria atrito" }], valueAnalysis: [{ value: "Confiança", alignment: 40, explanation: "Baixa" }], culturalImpact: "Cultura de vigilância" }
    ]
  },
  {
    id: "15",
    title: "Reunião às 19h",
    description: "Seu chefe marca reunião obrigatória toda sexta às 19h.",
    context: "Vários pais e mães no time.",
    category: "Produtividade vs Vida Pessoal",
    options: [
      { id: "a", text: "Aceitar e participar sempre", overallScore: 38, feedback: "Priorizou trabalho sobre família.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 70, explanation: "Produtividade" }, { framework: "Virtude", score: 25, explanation: "Falta equilíbrio" }], valueAnalysis: [{ value: "Equilíbrio", alignment: 20, explanation: "Desequilibrado" }], culturalImpact: "Cultura workaholic" },
      { id: "b", text: "Questionar e propor horário melhor", overallScore: 96, feedback: "Defendeu equilíbrio com coragem.", ethicalAnalysis: [{ framework: "Virtude", score: 98, explanation: "Coragem e respeito à vida pessoal" }], valueAnalysis: [{ value: "Coragem", alignment: 95, explanation: "Enfrenta chefe" }, { value: "Família", alignment: 100, explanation: "Prioriza vida" }], culturalImpact: "Cultura respeitosa" },
      { id: "c", text: "Participar só quando for realmente urgente", overallScore: 82, feedback: "Meio termo funcional.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 88, explanation: "Funciona na prática" }], valueAnalysis: [{ value: "Flexibilidade", alignment: 85, explanation: "Razoável" }], culturalImpact: "Cultura negociável" },
      { id: "d", text: "Fingir problema técnico toda sexta", overallScore: 48, feedback: "Solução infantil.", ethicalAnalysis: [{ framework: "Deontologia", score: 40, explanation: "Desonestidade" }], valueAnalysis: [{ value: "Honestidade", alignment: 30, explanation: "Baixa" }], culturalImpact: "Cultura de mentira" }
    ]
  },
  {
    id: "16",
    title: "Estagiário Gênio Problemático",
    description: "O estagiário é brilhante, mas extremamente grosso com toda a equipe.",
    context: "Ele entrega 3x mais que os outros, mas ninguém aguenta trabalhar com ele.",
    category: "Talento vs Clima",
    options: [
      { id: "a", text: "Manter e ignorar o comportamento", overallScore: 45, feedback: "Priorizou resultado sobre pessoas.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 85, explanation: "Entrega alta" }, { framework: "Virtude", score: 20, explanation: "Tolerância tóxica" }], valueAnalysis: [{ value: "Respeito", alignment: 15, explanation: "Muito baixo" }], culturalImpact: "Cultura tóxica de gênios" },
      { id: "b", text: "Demitir imediatamente", overallScore: 78, feedback: "Protegeu o time, mas perdeu talento.", ethicalAnalysis: [{ framework: "Virtude", score: 90, explanation: "Protege o coletivo" }], valueAnalysis: [{ value: "Respeito", alignment: 100, explanation: "Total ao time" }], culturalImpact: "Cultura saudável, mas menos produtiva" },
      { id: "c", text: "Dar feedback estruturado com prazo pra melhorar", overallScore: 98, feedback: "Melhor solução: talento + respeito.", ethicalAnalysis: [{ framework: "Virtude", score: 99, explanation: "Liderança exemplar" }], valueAnalysis: [{ value: "Liderança", alignment: 100, explanation: "Desenvolve pessoa" }, { value: "Desenvolvimento", alignment: 98, explanation: "Dá chance real" }], culturalImpact: "Cultura de alto desempenho e respeito" },
      { id: "d", text: "Isolar ele em projetos individuais", overallScore: 68, feedback: "Funciona, mas não resolve o problema.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 80, explanation: "Mantém entrega" }], valueAnalysis: [{ value: "Colaboração", alignment: 50, explanation: "Baixa" }], culturalImpact: "Cultura fragmentada" }
    ]
  },
  {
    id: "17",
    title: "Sabotagem Interna",
    description: "Você descobre que um colega está sabotando outro para ser promovido.",
    context: "O sabotador é amigo próximo seu.",
    category: "Lealdade vs Justiça",
    options: [
      { id: "a", text: "Não fazer nada", overallScore: 22, feedback: "Tolerou injustiça grave.", ethicalAnalysis: [{ framework: "Deontologia", score: 15, explanation: "Falha ética total" }], valueAnalysis: [{ value: "Justiça", alignment: 10, explanation: "Quase nula" }], culturalImpact: "Cultura de conluio" },
      { id: "b", text: "Denunciar anonimamente", overallScore: 78, feedback: "Protegeu vítima, mas covarde.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 85, explanation: "Resolve o problema" }], valueAnalysis: [{ value: "Coragem", alignment: 60, explanation: "Parcial" }], culturalImpact: "Cultura de denúncias anônimas" },
      { id: "c", text: "Conversar com o sabotador primeiro", overallScore: 88, feedback: "Tentou restaurar com coragem.", ethicalAnalysis: [{ framework: "Virtude", score: 92, explanation: "Diálogo com responsabilidade" }], valueAnalysis: [{ value: "Amizade", alignment: 80, explanation: "Tentou preservar" }, { value: "Justiça", alignment: 90, explanation: "Alta" }], culturalImpact: "Cultura madura" },
      { id: "d", text: "Denunciar diretamente ao chefe", overallScore: 96, feedback: "Melhor solução ética.", ethicalAnalysis: [{ framework: "Deontologia", score: 98, explanation: "Dever cumprido" }], valueAnalysis: [{ value: "Coragem", alignment: 100, explanation: "Total" }, { value: "Justiça", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura justa e transparente" }
    ]
  },
  {
    id: "18",
    title: "Uso Indevido do Cartão Corporativo",
    description: "Você vê o CEO usando o cartão corporativo pra jantar de família.",
    context: "Valor: R$ 8.000. Empresa está cortando café.",
    category: "Igualdade vs Hierarquia",
    options: [
      { id: "a", text: "Ignorar, é o CEO", overallScore: 28, feedback: "Aceitou dois pesos.", ethicalAnalysis: [{ framework: "Deontologia", score: 20, explanation: "Viola igualdade" }], valueAnalysis: [{ value: "Justiça", alignment: 15, explanation: "Muito baixa" }], culturalImpact: "Cultura de privilégios" },
      { id: "b", text: "Reportar ao conselho", overallScore: 98, feedback: "Defendeu governança.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Regras valem pra todos" }], valueAnalysis: [{ value: "Coragem", alignment: 100, explanation: "Exemplar" }], culturalImpact: "Cultura de accountability" },
      { id: "c", text: "Conversar em particular com o CEO", overallScore: 88, feedback: "Respeitoso e corajoso.", ethicalAnalysis: [{ framework: "Virtude", score: 94, explanation: "Diálogo com hierarquia" }], valueAnalysis: [{ value: "Respeito", alignment: 90, explanation: "Alta" }], culturalImpact: "Cultura adulta" },
      { id: "d", text: "Fazer piada no grupo do WhatsApp", overallScore: 45, feedback: "Criou clima ruim.", ethicalAnalysis: [{ framework: "Virtude", score: 50, explanation: "Falta de maturidade" }], valueAnalysis: [{ value: "Respeito", alignment: 40, explanation: "Baixo" }], culturalImpact: "Cultura de fofoca" }
    ]
  },
  {
    id: "19",
    title: "Falsa Promessa de Promoção",
    description: "Chefe promete promoção pra você segurar um projeto crítico.",
    context: "Você sabe que não vai rolar.",
    category: "Honestidade vs Motivação",
    options: [
      { id: "a", text: "Aceitar a mentira pra motivar o time", overallScore: 38, feedback: "Comprometeu confiança futura.", ethicalAnalysis: [{ framework: "Deontologia", score: 25, explanation: "Mentira intencional" }], valueAnalysis: [{ value: "Confiança", alignment: 30, explanation: "Grave dano futuro" }], culturalImpact: "Cultura de promessas vazias" },
      { id: "b", text: "Exigir compromisso por escrito", overallScore: 92, feedback: "Protegeu você e a verdade.", ethicalAnalysis: [{ framework: "Deontologia", score: 95, explanation: "Honestidade forçada" }], valueAnalysis: [{ value: "Prudência", alignment: 98, explanation: "Muito alta" }], culturalImpact: "Cultura de acordos claros" },
      { id: "c", text: "Aceitar mas já procurar outro emprego", overallScore: 68, feedback: "Desengajamento silencioso.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 75, explanation: "Se protege" }], valueAnalysis: [{ value: "Lealdade", alignment: 50, explanation: "Baixa" }], culturalImpact: "Cultura de transição" },
      { id: "d", text: "Recusar e ser honesto com o time", overallScore: 96, feedback: "Liderança ética exemplar.", ethicalAnalysis: [{ framework: "Virtude", score: 99, explanation: "Transparência total" }], valueAnalysis: [{ value: "Liderança", alignment: 100, explanation: "Inspiradora" }], culturalImpact: "Cultura de confiança real" }
    ]
  },
  {
    id: "20",
    title: "Furto de Ideia",
    description: "Seu chefe apresenta sua ideia como dele na reunião com diretoria.",
    context: "Ideia pode gerar R$ 5 mi em economia.",
    category: "Reconhecimento vs Paz",
    options: [
      { id: "a", text: "Deixar pra lá", overallScore: 48, feedback: "Engoliu sapo grande.", ethicalAnalysis: [{ framework: "Virtude", score: 60, explanation: "Humildade, mas injustiça" }], valueAnalysis: [{ value: "Reconhecimento", alignment: 20, explanation: "Negado" }], culturalImpact: "Cultura de apropriação" },
      { id: "b", text: "Corrigir na hora na reunião", overallScore: 94, feedback: "Assertivo e justo.", ethicalAnalysis: [{ framework: "Virtude", score: 96, explanation: "Coragem e justiça" }], valueAnalysis: [{ value: "Coragem", alignment: 98, explanation: "Alta" }], culturalImpact: "Cultura de crédito correto" },
      { id: "c", text: "Conversar em particular depois", overallScore: 88, feedback: "Respeitoso e eficaz.", ethicalAnalysis: [{ framework: "Virtude", score: 92, explanation: "Diálogo maduro" }], valueAnalysis: [{ value: "Respeito", alignment: 95, explanation: "Alta" }], culturalImpact: "Cultura adulta" },
      { id: "d", text: "Mandar e-mail pra todos corrigindo", overallScore: 72, feedback: "Passivo-agressivo.", ethicalAnalysis: [{ framework: "Virtude", score: 70, explanation: "Falta tato" }], valueAnalysis: [{ value: "Assertividade", alignment: 85, explanation: "Alta, mas mal executada" }], culturalImpact: "Cultura de e-mails" }
    ]
  },
  {
    id: "21",
    title: "Home Office Falso",
    description: "Funcionário excelente mora em outra cidade e finge estar em SP.",
    context: "Entrega tudo perfeitamente.",
    category: "Regra vs Resultado",
    options: [
      { id: "a", text: "Demitir por mentir", overallScore: 55, feedback: "Rígido demais.", ethicalAnalysis: [{ framework: "Deontologia", score: 90, explanation: "Mentira é mentira" }], valueAnalysis: [{ value: "Flexibilidade", alignment: 40, explanation: "Baixa" }], culturalImpact: "Cultura rígida" },
      { id: "b", text: "Fazer vista grossa", overallScore: 85, feedback: "Foco no resultado.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 92, explanation: "Entrega perfeita" }], valueAnalysis: [{ value: "Confiança", alignment: 70, explanation: "Baseada em entrega" }], culturalImpact: "Cultura de resultados" },
      { id: "c", text: "Conversar e formalizar home office", overallScore: 98, feedback: "Melhor solução moderna.", ethicalAnalysis: [{ framework: "Virtude", score: 99, explanation: "Liderança contemporânea" }], valueAnalysis: [{ value: "Flexibilidade", alignment: 100, explanation: "Total" }, { value: "Confiança", alignment: 98, explanation: "Alta" }], culturalImpact: "Cultura remota saudável" },
      { id: "d", text: "Exigir volta imediata", overallScore: 42, feedback: "Retrógado.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 30, explanation: "Perde talento" }], valueAnalysis: [{ value: "Adaptação", alignment: 20, explanation: "Nula" }], culturalImpact: "Cultura presencial forçada" }
    ]
  },
  {
    id: "22",
    title: "PI Arbitrária",
    description: "Chefe coloca você em PI sem motivo real.",
    context: "Você bateu todas as metas.",
    category: "Justiça vs Sobrevivência",
    options: [
      { id: "a", text: "Aceitar calado", overallScore: 35, feedback: "Submissão total.", ethicalAnalysis: [{ framework: "Virtude", score: 40, explanation: "Falta de auto-respeito" }], valueAnalysis: [{ value: "Dignidade", alignment: 30, explanation: "Baixa" }], culturalImpact: "Cultura do medo" },
      { id: "b", text: "Questionar por escrito com dados", overallScore: 96, feedback: "Assertivo e profissional.", ethicalAnalysis: [{ framework: "Virtude", score: 98, explanation: "Coragem com fatos" }], valueAnalysis: [{ value: "Justiça", alignment: 100, explanation: "Baseada em méritos" }], culturalImpact: "Cultura de dados" },
      { id: "c", text: "Procurar outro emprego imediatamente", overallScore: 82, feedback: "Se protegeu.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 88, explanation: "Minimiza dano" }], valueAnalysis: [{ value: "Autoproteção", alignment: 95, explanation: "Alta" }], culturalImpact: "Rotatividade alta" },
      { id: "d", text: "Fazer corpo mole no PI", overallScore: 48, feedback: "Infantil.", ethicalAnalysis: [{ framework: "Virtude", score: 45, explanation: "Falta de profissionalismo" }], valueAnalysis: [{ value: "Maturidade", alignment: 40, explanation: "Baixa" }], culturalImpact: "Cultura de revanchismo" }
    ]
  },
  {
    id: "23",
    title: "Demissão Coletiva por E-mail",
    description: "500 pessoas serão demitidas por e-mail amanhã.",
    context: "Você é líder de 40 delas.",
    category: "Empatia vs Obediência",
    options: [
      { id: "a", text: "Seguir o script oficial", overallScore: 42, feedback: "Frio e desumano.", ethicalAnalysis: [{ framework: "Virtude", score: 35, explanation: "Falta de empatia" }], valueAnalysis: [{ value: "Humanidade", alignment: 30, explanation: "Baixa" }], culturalImpact: "Cultura desumanizada" },
      { id: "b", text: "Avisar seu time antes", overallScore: 68, feedback: "Quebrou protocolo, mas humano.", ethicalAnalysis: [{ framework: "Virtude", score: 85, explanation: "Empatia com risco" }], valueAnalysis: [{ value: "Liderança", alignment: 90, explanation: "Humana" }], culturalImpact: "Líderes que cuidam" },
      { id: "c", text: "Fazer reuniões individuais presenciais", overallScore: 98, feedback: "Liderança exemplar em crise.", ethicalAnalysis: [{ framework: "Virtude", score: 100, explanation: "Dignidade máxima" }], valueAnalysis: [{ value: "Empatia", alignment: 100, explanation: "Total" }, { value: "Coragem", alignment: 98, explanation: "Enfrenta empresa" }], culturalImpact: "Cultura humana mesmo em crise" },
      { id: "d", text: "Pedir demissão em protesto", overallScore: 88, feedback: "Nobre, mas extremo.", ethicalAnalysis: [{ framework: "Virtude", score: 95, explanation: "Sacrifício moral" }], valueAnalysis: [{ value: "Coragem", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura de mártires" }
    ]
  },
  {
    id: "24",
    title: "Cliente Pedófilo",
    description: "Cliente importante é condenado por pedofilia.",
    context: "Contrato de R$ 15 mi/ano.",
    category: "Lucro vs Moral",
    options: [
      { id: "a", text: "Manter o cliente", overallScore: 12, feedback: "Cruzou linha moral absoluta.", ethicalAnalysis: [{ framework: "Deontologia", score: 5, explanation: "Inaceitável" }], valueAnalysis: [{ value: "Moral", alignment: 5, explanation: "Quase nula" }], culturalImpact: "Cultura sem limites morais" },
      { id: "b", text: "Cancelar contrato imediatamente", overallScore: 99, feedback: "Defendeu o inegociável.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Há linhas que não se cruzam" }], valueAnalysis: [{ value: "Dignidade", alignment: 100, explanation: "Inabalável" }], culturalImpact: "Cultura com princípios absolutos" },
      { id: "c", text: "Esperar o contrato vencer", overallScore: 45, feedback: "Covarde.", ethicalAnalysis: [{ framework: "Virtude", score: 50, explanation: "Falta coragem moral" }], valueAnalysis: [{ value: "Coragem", alignment: 40, explanation: "Baixa" }], culturalImpact: "Cultura de conveniência" },
      { id: "d", text: "Doar o valor do contrato", overallScore: 68, feedback: "Lavagem moral.", ethicalAnalysis: [{ framework: "Virtude", score: 70, explanation: "Tentativa de compensação" }], valueAnalysis: [{ value: "Integridade", alignment: 60, explanation: "Parcial" }], culturalImpact: "Cultura hipócrita" }
    ]
  },
  {
    id: "25",
    title: "Estágio Não Remunerado",
    description: "Empresa quer criar 20 vagas de estágio sem salário.",
    context: "É ilegal e exploratório.",
    category: "Lucro vs Ética Trabalhista",
    options: [
      { id: "a", text: "Aprovar o programa", overallScore: 25, feedback: "Exploração pura.", ethicalAnalysis: [{ framework: "Deontologia", score: 10, explanation: "Ilegal e imoral" }], valueAnalysis: [{ value: "Justiça", alignment: 15, explanation: "Quase nula" }], culturalImpact: "Cultura exploratória" },
      { id: "b", text: "Recusar e propor com bolsa", overallScore: 98, feedback: "Defendeu direitos mínimos.", ethicalAnalysis: [{ framework: "Deontologia", score: 100, explanation: "Cumpre a lei" }], valueAnalysis: [{ value: "Justiça", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura ética com jovens" },
      { id: "c", text: "Aprovar mas com 'ajuda de custo'", overallScore: 58, feedback: "Disfarce de exploração.", ethicalAnalysis: [{ framework: "Deontologia", score: 50, explanation: "Jeitinho brasileiro" }], valueAnalysis: [{ value: "Honestidade", alignment: 45, explanation: "Baixa" }], culturalImpact: "Cultura do jeitinho" },
      { id: "d", text: "Aceitar só com contrato CLT", overallScore: 92, feedback: "Melhor caminho legal.", ethicalAnalysis: [{ framework: "Deontologia", score: 95, explanation: "Quase perfeito" }], valueAnalysis: [{ value: "Responsabilidade", alignment: 98, explanation: "Alta" }], culturalImpact: "Cultura trabalhista correta" }
    ]
  },
  {
    id: "26",
    title: "Assédio do Cliente",
    description: "Cliente importante assedia sexualmente sua funcionária.",
    context: "Contrato de R$ 12 mi/ano.",
    category: "Lucro vs Proteção",
    options: [
      { id: "a", text: "Pedir pra ela aguentar", overallScore: 8, feedback: "Cruel e ilegal.", ethicalAnalysis: [{ framework: "Deontologia", score: 5, explanation: "Inaceitável" }], valueAnalysis: [{ value: "Respeito", alignment: 5, explanation: "Quase nulo" }], culturalImpact: "Cultura tóxica extrema" },
      { id: "b", text: "Cancelar contrato na hora", overallScore: 99, feedback: "Defesa inegociável da equipe.", ethicalAnalysis: [{ framework: "Virtude", score: 100, explanation: "Proteção absoluta" }], valueAnalysis: [{ value: "Coragem", alignment: 100, explanation: "Total" }, { value: "Liderança", alignment: 100, explanation: "Exemplar" }], culturalImpact: "Cultura que protege pessoas" },
      { id: "c", text: "Trocar a funcionária de cliente", overallScore: 48, feedback: "Covarde e conivente.", ethicalAnalysis: [{ framework: "Virtude", score: 50, explanation: "Passa o problema" }], valueAnalysis: [{ value: "Coragem", alignment: 40, explanation: "Baixa" }], culturalImpact: "Cultura de proteção falsa" },
      { id: "d", text: "Dar ultimato ao cliente", overallScore: 94, feedback: "Corajoso e justo.", ethicalAnalysis: [{ framework: "Virtude", score: 96, explanation: "Enfrenta o problema" }], valueAnalysis: [{ value: "Respeito", alignment: 98, explanation: "Muito alto" }], culturalImpact: "Cultura de limites claros" }
    ]
  },
  {
    id: "27",
    title: "Fraude no Currículo",
    description: "Candidato finalista mentiu sobre formação em Harvard.",
    context: "É o melhor candidato tecnicamente.",
    category: "Competência vs Honestidade",
    options: [
      { id: "a", text: "Contratar mesmo assim", overallScore: 58, feedback: "Comprometeu padrão.", ethicalAnalysis: [{ framework: "Deontologia", score: 40, explanation: "Mentira grave" }], valueAnalysis: [{ value: "Confiança", alignment: 50, explanation: "Prejudicada" }], culturalImpact: "Cultura flexível com mentira" },
      { id: "b", text: "Desclassificar imediatamente", overallScore: 92, feedback: "Manteve integridade.", ethicalAnalysis: [{ framework: "Deontologia", score: 98, explanation: "Honestidade é base" }], valueAnalysis: [{ value: "Integridade", alignment: 100, explanation: "Total" }], culturalImpact: "Cultura confiável" },
      { id: "c", text: "Dar chance de explicar", overallScore: 88, feedback: "Humano e justo.", ethicalAnalysis: [{ framework: "Virtude", score: 94, explanation: "Segunda chance com verdade" }], valueAnalysis: [{ value: "Empatia", alignment: 90, explanation: "Alta" }], culturalImpact: "Cultura de redenção" },
      { id: "d", text: "Contratar em cargo menor", overallScore: 72, feedback: "Punição disfarçada.", ethicalAnalysis: [{ framework: "Virtude", score: 75, explanation: "Meio termo" }], valueAnalysis: [{ value: "Justiça", alignment: 80, explanation: "Razoável" }], culturalImpact: "Cultura punitiva" }
    ]
  },
  {
    id: "28",
    title: "Happy Hour Obrigatório",
    description: "Chefe torna happy hour de sexta obrigatório.",
    context: "Quem não vai é visto como 'não team player'.",
    category: "Liberdade vs Integração",
    options: [
      { id: "a", text: "Ir sempre mesmo odiando", overallScore: 42, feedback: "Submissão total.", ethicalAnalysis: [{ framework: "Virtude", score: 50, explanation: "Falta autenticidade" }], valueAnalysis: [{ value: "Autonomia", alignment: 30, explanation: "Baixa" }], culturalImpact: "Cultura de fachada" },
      { id: "b", text: "Recusar educadamente", overallScore: 94, feedback: "Defendeu liberdade pessoal.", ethicalAnalysis: [{ framework: "Virtude", score: 96, explanation: "Autenticidade" }], valueAnalysis: [{ value: "Coragem", alignment: 95, explanation: "Alta" }], culturalImpact: "Cultura adulta" },
      { id: "c", text: "Ir só de vez em quando", overallScore: 82, feedback: "Equilíbrio funcional.", ethicalAnalysis: [{ framework: "Utilitarismo", score: 88, explanation: "Funciona" }], valueAnalysis: [{ value: "Flexibilidade", alignment: 85, explanation: "Razoável" }], culturalImpact: "Cultura negociável" },
      { id: "d", text: "Criar evento alternativo inclusivo", overallScore: 98, feedback: "Liderança inclusiva.", ethicalAnalysis: [{ framework: "Virtude", score: 99, explanation: "Inclusão real" }], valueAnalysis: [{ value: "Liderança", alignment: 100, explanation: "Exemplar" }], culturalImpact: "Cultura verdadeiramente inclusiva" }
    ]
  },
  {
    id: "29",
    title: "Demissão por Doença Grave",
    description: "Funcionário descobre câncer e precisa de licença longa.",
    context: "Cargo é crítico e difícil de substituir.",
    category: "Empatia vs Negócio",
    options: [
      { id: "a", text: "Demitir durante a licença", overallScore: 15, feedback: "Desumano e possivelmente ilegal.", ethicalAnalysis: [{ framework: "Virtude", score: 10, explanation: "Falta total de humanidade" }], valueAnalysis: [{ value: "Empatia", alignment: 5, explanation: "Quase nula" }], culturalImpact: "Cultura cruel" },
      { id: "b", text: "Garantir emprego e apoio total", overallScore: 98, feedback: "Liderança humana exemplar.", ethicalAnalysis: [{ framework: "Virtude", score: 100, explanation: "Compassion máxima" }], valueAnalysis: [{ value: "Humanidade", alignment: 100, explanation: "Total" }, { value: "Liderança", alignment: 98, explanation: "Inspiradora" }], culturalImpact: "Cultura que cuida de verdade" },
      { id: "c", text: "Manter mas reduzir salário", overallScore: 45, feedback: "Frio e injusto.", ethicalAnalysis: [{ framework: "Virtude", score: 50, explanation: "Falta de solidariedade" }], valueAnalysis: [{ value: "Empatia", alignment: 40, explanation: "Baixa" }], culturalImpact: "Cultura mercenária" },
      { id: "d", text: "Criar vaquinha interna", overallScore: 88, feedback: "Bonito, mas não substitui dever.", ethicalAnalysis: [{ framework: "Virtude", score: 90, explanation: "Solidariedade voluntária" }], valueAnalysis: [{ value: "Comunidade", alignment: 95, explanation: "Alta" }], culturalImpact: "Cultura solidária" }
    ]
  },
  {
    id: "30",
    title: "O Último Dia",
    description: "Você descobre que amanhã será demitido após 18 anos de empresa.",
    context: "Você tem acesso a dados estratégicos sensíveis.",
    category: "Lealdade vs Autoproteção",
    options: [
      { id: "a", text: "Levar dados confidenciais pra casa", overallScore: 22, feedback: "Traiu a confiança da empresa.", ethicalAnalysis: [{ framework: "Deontologia", score: 10, explanation: "Roubo de propriedade intelectual" }], valueAnalysis: [{ value: "Lealdade", alignment: 5, explanation: "Traição total" }], culturalImpact: "Cultura de desconfiança" },
      { id: "b", text: "Sair de cabeça erguida, sem levar nada", overallScore: 99, feedback: "Manteve dignidade e ética até o fim.", ethicalAnalysis: [{ framework: "Virtude", score: 100, explanation: "Integridade impecável" }], valueAnalysis: [{ value: "Dignidade", alignment: 100, explanation: "Exemplar" }, { value: "Profissionalismo", alignment: 100, explanation: "Inabalável" }], culturalImpact: "Cultura de respeito mútuo" },
      { id: "c", text: "Avisar colegas sobre a demissão", overallScore: 68, feedback: "Quebrou confidencialidade.", ethicalAnalysis: [{ framework: "Deontologia", score: 60, explanation: "Sigilo violado" }], valueAnalysis: [{ value: "Lealdade", alignment: 70, explanation: "Com colegas" }], culturalImpact: "Clima de incerteza" },
      { id: "d", text: "Documentar tudo e entregar pro RH", overallScore: 94, feedback: "Profissionalismo total.", ethicalAnalysis: [{ framework: "Virtude", score: 98, explanation: "Transição responsável" }], valueAnalysis: [{ value: "Responsabilidade", alignment: 100, explanation: "Completa" }], culturalImpact: "Cultura madura" }
    ]
  }
];
  
  const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [dilemaIndex, setDilemaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => setScreen('menu'), 3500);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const nextDilema = () => {
    if (dilemaIndex < DILEMAS.length - 1) {
      setDilemaIndex(dilemaIndex + 1);
      setSelectedOption(null);
      setScreen('game');
    } else {
      setScreen('end');
    }
  };

  const current = DILEMAS[dilemaIndex];

  if (screen === 'splash') return (
    <div style={{width:'100%',height:'100vh',backgroundImage:`url('/splash_bg.png')`,backgroundSize:'cover',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <h1 style={{fontSize:'64px',color:'#FFD93D',textShadow:'0 0 30px #FFD93D',fontFamily:'Poppins, sans-serif'}}>Caminho dos Valores</h1>
    </div>
  );

  if (screen === 'menu') return (
    <div style={{width:'100%',height:'100vh',backgroundImage:`url('/menu_bg.png')`,backgroundSize:'cover',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',zIndex:10}}>
        <h1 style={{fontSize:'48px',color:'#FFD93D',fontFamily:'Poppins, sans-serif',marginBottom:'40px'}}>Caminho dos Valores</h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginBottom:'50px'}}>
          {['icon_lantern.png','icon_balance.png','icon_heart.png'].map((ic,i)=>
            <div key={i}><img src={`/${ic}`} style={{width:80,height:80}}/><p style={{color:'#FFD93D',fontWeight:'bold'}}>{['Ética','Valores','Cultura'][i]}</p></div>
          )}
        </div>
        <button onClick={()=>setScreen('game')} style={{padding:'20px 60px',background:'#FFD93D',color:'#2D1B69',border:'none',borderRadius:'12px',fontSize:'22px',fontWeight:'bold',cursor:'pointer'}}>
          Iniciar Jornada (30 Dilemas)
        </button>
      </div>
    </div>
  );

  if (screen === 'game' && !selectedOption) return (
    <div style={{minHeight:'100vh',background:'#2D1B69',color:'#FFF',padding:'40px',textAlign:'center',fontFamily:'Poppins, sans-serif'}}>
      <p style={{color:'#FFD93D'}}>Dilema {dilemaIndex+1} de {DILEMAS.length}</p>
      <h1 style={{fontSize:'36px',color:'#FFD93D',margin:'20px 0'}}>{current.title}</h1>
      <div style={{maxWidth:'800px',margin:'0 auto 40px',background:'rgba(108,99,255,0.2)',padding:'25px',borderRadius:'12px',border:'1px solid #FFD93D'}}>
        <p style={{fontSize:'18px',lineHeight:'1.7'}}>{current.description}</p>
        <p style={{fontStyle:'italic',color:'#FFD93D',marginTop:'15px'}}>{current.context}</p>
      </div>
      <div style={{display:'grid',gap:'15px',maxWidth:'800px',margin:'0 auto'}}>
        {current.options.map(opt => (
          <button key={opt.id} onClick={()=>setSelectedOption(opt)} style={{padding:'20px',background:'rgba(108,99,255,0.3)',border:'2px solid #FFD93D',borderRadius:'12px',color:'#FFF',fontSize:'17px',textAlign:'left',cursor:'pointer'}}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );

  if (selectedOption) return (
    <div style={{minHeight:'100vh',background:'#2D1B69',color:'#FFF',padding:'40px',fontFamily:'Poppins, sans-serif'}}>
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>
        <h2 style={{color:'#FFD93D',textAlign:'center',fontSize:'32px',marginBottom:'30px'}}>Análise da Sua Escolha</h2>
        <div style={{background:'rgba(108,99,255,0.2)',padding:'25px',borderRadius:'12px',border:'1px solid #FFD93D',marginBottom:'30px'}}>
          <p style={{fontSize:'18px'}}>{selectedOption.feedback}</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
          <div style={{background:'rgba(108,99,255,0.2)',padding:'20px',borderRadius:'12px',border:'1px solid #FFD93D'}}>
            <h3 style={{color:'#FFD93D'}}>Análise Ética</h3>
            {selectedOption.ethicalAnalysis.map(a=>(
              <div key={a.framework} style={{margin:'15px 0'}}>
                <strong>{a.framework}:</strong> {a.score}/100<br/>
                <small style={{color:'#CCC'}}>{a.explanation}</small>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(108,99,255,0.2)',padding:'20px',borderRadius:'12px',border:'1px solid #FFD93D'}}>
            <h3 style={{color:'#FFD93D'}}>Alinhamento de Valores</h3>
            {selectedOption.valueAnalysis.map(v=>(
              <div key={v.value} style={{margin:'15px 0'}}>
                <strong>{v.value}:</strong> {v.alignment}/100<br/>
                <small style={{color:'#CCC'}}>{v.explanation}</small>
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:'50px'}}>
          <button onClick={nextDilema} style={{padding:'18px 50px',background:'#FFD93D',color:'#2D1B69',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer'}}>
            {dilemaIndex < DILEMAS.length-1 ? 'Próximo Dilema →' : 'Ver Resultado Final'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#2D1B69',color:'#FFF',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px'}}>
      <h1 style={{fontSize:'48px',color:'#FFD93D'}}>Jornada Concluída!</h1>
      <p style={{fontSize:'22px',maxWidth:'700px'}}>Você enfrentou {DILEMAS.length} dilemas éticos reais do mundo corporativo.</p>
      <button onClick={()=> {setScreen('menu'); setDilemaIndex(0);}} style={{marginTop:'40px',padding:'20px 60px',background:'#FFD93D',color:'#2D1B69',border:'none',borderRadius:'12px',fontSize:'20px',fontWeight:'bold',cursor:'pointer'}}>
        Jogar Novamente
      </button>
    </div>
  );
};

export default App;