import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Types
interface Player {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  creator: string;
  players: Player[];
  maxPlayers: number;
  difficulty: 'fácil' | 'médio' | 'difícil';
  status: 'waiting' | 'playing' | 'finished';
}

interface Dilema {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    text: string;
    value: string;
  }>;
}

// Screen Types
type Screen = 'splash' | 'menu' | 'lobby' | 'waiting' | 'game' | 'end';

const SOCKET_URL = "https://caminho-dos-valores.onrender.com";

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [socket, setSocket] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('médio');
  const [currentDilema, setCurrentDilema] = useState<Dilema | null>(null);
  const [gameResults, setGameResults] = useState<any>(null);

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket conectado:', newSocket.id);
      (window as any).socket = newSocket;
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('❌ Erro de conexão:', error);
    });

    newSocket.on('rooms_list', (roomsList: Room[]) => {
      console.log('📋 Salas recebidas:', roomsList);
      setRooms(roomsList);
    });

    newSocket.on('room_joined', (room: Room) => {
      console.log('✅ Entrou na sala:', room);
      setCurrentRoom(room);
      setScreen('lobby');
    });

    newSocket.on('room_created', (room: Room) => {
      console.log('✅ Sala criada:', room);
      setCurrentRoom(room);
      setScreen('lobby');
    });

    newSocket.on('game_started', (dilema: Dilema) => {
      console.log('🎮 Jogo iniciado:', dilema);
      setCurrentDilema(dilema);
      setScreen('game');
    });

    newSocket.on('game_ended', (results: any) => {
      console.log('🏁 Jogo finalizado:', results);
      setGameResults(results);
      setScreen('end');
    });

    newSocket.on('player_joined', (room: Room) => {
      console.log('👤 Novo jogador:', room);
      setCurrentRoom(room);
    });

    newSocket.on('player_removed', (room: Room) => {
      console.log('❌ Jogador removido:', room);
      setCurrentRoom(room);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Splash screen timer
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('menu');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Handlers
  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }
    socket.emit('create_room', {
      playerName,
      maxPlayers,
      difficulty,
    });
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !playerName.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }
    socket.emit('join_room', {
      roomId,
      playerName,
    });
  };

  const handleStartGame = () => {
    if (socket && currentRoom) {
      socket.emit('start_game', {
        roomId: currentRoom.id,
      });
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (socket && currentRoom) {
      socket.emit('remove_player', {
        roomId: currentRoom.id,
        playerId,
      });
    }
  };

  const handleAnswerDilema = (optionId: string) => {
    if (socket && currentRoom && currentDilema) {
      socket.emit('answer_dilema', {
        roomId: currentRoom.id,
        dilemaId: currentDilema.id,
        optionId,
      });
    }
  };

  const handleBackToMenu = () => {
    setScreen('menu');
    setCurrentRoom(null);
    setPlayerName('');
  };

  // Render Screens
  const renderSplash = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundImage: `url('/public/splash_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Logo */}
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

  const renderMenu = () => (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundImage: `url('/public/menu_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Semi-transparent overlay */}
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
        {/* Title */}
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

        {/* Player Name Input */}
        <input
          key="menu-name-input"
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
            transition: 'all 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 217, 61, 0.6)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {/* Values Icons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '40px',
        }}>
          {/* Casos - Lanterna */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            <img src="/public/icon_lantern.png" alt="Casos" style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
            }} />
            <span style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 0 10px rgba(255, 217, 61, 0.5)',
            }}>Casos</span>
          </div>

          {/* Deie Moral - Balança */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            <img src="/public/icon_balance.png" alt="Deie Moral" style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
            }} />
            <span style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 0 10px rgba(255, 217, 61, 0.5)',
            }}>Deie Moral</span>
          </div>

          {/* Emocional - Coração */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            <img src="/public/icon_heart.png" alt="Emocional" style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
            }} />
            <span style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 0 10px rgba(255, 217, 61, 0.5)',
            }}>Emocional</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}>
          <button
            onClick={handleCreateRoom}
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
              boxShadow: '0 4px 15px rgba(255, 217, 61, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 217, 61, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 217, 61, 0.4)';
            }}
          >
            Criar Sala
          </button>

          <button
            onClick={() => {
              if (socket) {
                socket.emit('get_rooms');
              }
              setScreen('lobby');
            }}
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
              boxShadow: '0 4px 15px rgba(108, 99, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 99, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(108, 99, 255, 0.4)';
            }}
          >
            Entrar em Sala
          </button>
        </div>
      </div>
    </div>
  );

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
        {currentRoom ? currentRoom.name : 'Salas Disponíveis'}
      </h1>

      {currentRoom ? (
        <div style={{
          backgroundColor: 'rgba(108, 99, 255, 0.2)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '600px',
          width: '100%',
        }}>
          <h2 style={{ color: '#FFD93D', marginBottom: '20px' }}>
            Jogadores ({currentRoom.players.length}/{currentRoom.maxPlayers})
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '30px',
          }}>
            {currentRoom.players.map((player) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 15px',
                backgroundColor: 'rgba(255, 217, 61, 0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
              }}>
                <span>{player.name}</span>
                {currentRoom.creator === socket?.id && player.id !== socket?.id && (
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#FF6B9D',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentRoom.creator === socket?.id && (
            <button
              onClick={handleStartGame}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#FFD93D',
                color: '#2D1B69',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
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
              Iniciar Jogo
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '1000px',
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
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 217, 61, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <h3 style={{ color: '#FFD93D', marginBottom: '10px' }}>{room.name}</h3>
              <p style={{ color: '#FFFFFF', marginBottom: '5px' }}>
                Jogadores: {room.players.length}/{room.maxPlayers}
              </p>
              <p style={{ color: '#FFFFFF', marginBottom: '15px' }}>
                Dificuldade: {room.difficulty}
              </p>
              <button
                onClick={() => handleJoinRoom(room.id)}
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
      )}

      <button
        onClick={handleBackToMenu}
        style={{
          marginTop: '30px',
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
                onClick={() => handleAnswerDilema(option.id)}
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
      {gameResults && (
        <div style={{
          backgroundColor: 'rgba(108, 99, 255, 0.2)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '600px',
          width: '100%',
          marginBottom: '30px',
        }}>
          <pre style={{
            color: '#FFFFFF',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}>
            {JSON.stringify(gameResults, null, 2)}
          </pre>
        </div>
      )}
      <button
        onClick={handleBackToMenu}
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
