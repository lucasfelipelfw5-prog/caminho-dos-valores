import React, { useState, useEffect } from 'react';

type Screen = 'splash' | 'menu' | 'lobby' | 'game' | 'end';

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  difficulty: string;
}

interface Dilema {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    text: string;
  }>;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Sala do Lucas', players: 2, maxPlayers: 4, difficulty: 'médio' },
    { id: '2', name: 'Sala dos Amigos', players: 1, maxPlayers: 6, difficulty: 'fácil' },
    { id: '3', name: 'Desafio Extremo', players: 3, maxPlayers: 4, difficulty: 'difícil' },
  ]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentDilema, setCurrentDilema] = useState<Dilema | null>({
    id: '1',
    title: 'O Dilema do Trem',
    description: 'Um trem descontrolado está vindo em sua direção. Você pode puxar uma alavanca para desviar o trem para outro trilho, mas nesse trilho há uma pessoa. O que você faz?',
    options: [
      { id: '1', text: 'Puxar a alavanca e desviar o trem' },
      { id: '2', text: 'Não fazer nada e deixar o trem seguir seu curso' },
      { id: '3', text: 'Tentar avisar as pessoas' },
    ],
  });

  // Splash screen timer
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('menu');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Render Splash
  const renderSplash = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundImage: `url('/splash_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'fadeInScale 2s ease-in-out',
      }}>
        <h1 style={{
          fontSize: '64px',
          fontWeight: 'bold',
          color: '#FFD93D',
          textShadow: '0 0 30px rgba(255, 217, 61, 0.8), 0 0 60px rgba(108, 99, 255, 0.6)',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '3px',
          margin: 0,
          animation: 'glow 2s ease-in-out infinite',
        }}>
          Caminho dos Valores
        </h1>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes glow {
          0%, 100% {
            textShadow: 0 0 30px rgba(255, 217, 61, 0.8), 0 0 60px rgba(108, 99, 255, 0.6);
          }
          50% {
            textShadow: 0 0 50px rgba(255, 217, 61, 1), 0 0 80px rgba(108, 99, 255, 0.8);
          }
        }
      `}</style>
    </div>
  );

  // Render Menu
  const renderMenu = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundImage: `url('/menu_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(45, 27, 105, 0.3)',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '600px',
        width: '90%',
        padding: '40px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#FFD93D',
          textShadow: '0 0 20px rgba(255, 217, 61, 0.6)',
          fontFamily: 'Poppins, sans-serif',
          marginBottom: '30px',
          letterSpacing: '2px',
        }}>
          Caminho dos Valores
        </h1>

        <input
          type="text"
          placeholder="Digite seu nome"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{
            width: '100%',
            padding: '15px 20px',
            fontSize: '18px',
            fontFamily: 'Poppins, sans-serif',
            border: '2px solid #FFD93D',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#2D1B69',
            marginBottom: '30px',
            boxSizing: 'border-box',
          }}
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '40px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <img src="/icon_lantern.png" alt="Casos" style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
            }} />
            <span style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
            }}>Casos</span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <img src="/icon_balance.png" alt="Deie Moral" style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
            }} />
            <span style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
            }}>Deie Moral</span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <img src="/icon_heart.png" alt="Emocional" style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
            }} />
            <span style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
            }}>Emocional</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}>
          <button
            onClick={() => setScreen('lobby')}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: '#FFD93D',
              color: '#2D1B69',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Criar Sala
          </button>

          <button
            onClick={() => setScreen('lobby')}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: '#6C63FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Entrar em Sala
          </button>
        </div>
      </div>
    </div>
  );

  // Render Lobby
  const renderLobby = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#2D1B69',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <h1 style={{
        color: '#FFD93D',
        fontSize: '40px',
        marginBottom: '30px',
      }}>
        Salas Disponíveis
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1000px',
        marginBottom: '30px',
      }}>
        {rooms.map((room) => (
          <div key={room.id} style={{
            backgroundColor: 'rgba(108, 99, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #FFD93D',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <h3 style={{ color: '#FFD93D', marginBottom: '10px' }}>{room.name}</h3>
            <p style={{ color: '#FFFFFF', marginBottom: '5px' }}>
              Jogadores: {room.players}/{room.maxPlayers}
            </p>
            <p style={{ color: '#FFFFFF', marginBottom: '15px' }}>
              Dificuldade: {room.difficulty}
            </p>
            <button
              onClick={() => {
                setCurrentRoom(room);
                setScreen('game');
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#FFD93D',
                color: '#2D1B69',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Entrar
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setScreen('menu')}
        style={{
          padding: '10px 30px',
          backgroundColor: '#FF6B9D',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Voltar
      </button>
    </div>
  );

  // Render Game
  const renderGame = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#2D1B69',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {currentDilema && (
        <div style={{
          maxWidth: '800px',
          width: '100%',
        }}>
          <h1 style={{
            color: '#FFD93D',
            fontSize: '32px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            {currentDilema.title}
          </h1>
          <p style={{
            color: '#FFFFFF',
            fontSize: '18px',
            marginBottom: '40px',
            textAlign: 'center',
            lineHeight: '1.6',
          }}>
            {currentDilema.description}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '15px',
          }}>
            {currentDilema.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setScreen('end')}
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(108, 99, 255, 0.3)',
                  color: '#FFFFFF',
                  border: '2px solid #FFD93D',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Poppins, sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 217, 61, 0.2)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(108, 99, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render End
  const renderEnd = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#2D1B69',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <h1 style={{
        color: '#FFD93D',
        fontSize: '48px',
        marginBottom: '30px',
      }}>
        Jogo Finalizado!
      </h1>
      <p style={{
        color: '#FFFFFF',
        fontSize: '20px',
        marginBottom: '30px',
        textAlign: 'center',
      }}>
        Obrigado por jogar Caminho dos Valores!
      </p>
      <button
        onClick={() => setScreen('menu')}
        style={{
          padding: '15px 30px',
          backgroundColor: '#FFD93D',
          color: '#2D1B69',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Voltar ao Menu
      </button>
    </div>
  );

  // Main render
  switch (screen) {
    case 'splash':
      return renderSplash();
    case 'menu':
      return renderMenu();
    case 'lobby':
      return renderLobby();
    case 'game':
      return renderGame();
    case 'end':
      return renderEnd();
    default:
      return renderMenu();
  }
};

export default App;
