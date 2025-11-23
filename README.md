# 🎮 Caminho dos Valores

Um jogo multiplayer de dilemas e escolhas que descobre seu perfil moral e ético.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Deploy**: Vercel (Frontend) + Railway (Backend)

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn

## 🏃 Como Rodar Localmente

### Backend

```bash
cd backend
npm install
npm run dev
```

O servidor rodará em `http://localhost:3333`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend rodará em `http://localhost:5173`

## 🌐 Deploy

### Frontend (Vercel)

1. Push para GitHub
2. Conectar Vercel ao repositório
3. Vercel fará deploy automático

### Backend (Railway)

1. Push para GitHub
2. Conectar Railway ao repositório
3. Configurar variáveis de ambiente
4. Railway fará deploy automático

## 📝 Variáveis de Ambiente

### Backend (.env)

```
PORT=3333
NODE_ENV=production
```

### Frontend (.env)

```
VITE_SOCKET_URL=https://seu-backend-railway.up.railway.app
```

## 🎮 Como Jogar

1. Acesse o site
2. Crie uma sala ou entre em uma existente
3. Configure o número de jogadores e dificuldade
4. Responda aos dilemas
5. Veja seu perfil moral ao final

## 📊 Valores

- **Honestidade**: Fazer o certo mesmo quando ninguém está vendo
- **Empatia**: Considerar os sentimentos dos outros
- **Coragem**: Enfrentar desafios e riscos
- **Pragmatismo**: Ser prático e realista

## 👨‍💻 Autor

Lucas Felipe - lucasfelipelfw5@gmail.com

## 📄 Licença

MIT
