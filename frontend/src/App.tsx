import React, { useState, useEffect, CSSProperties } from 'react';
import { io, Socket } from 'socket.io-client';

type Screen = 'splash' | 'menu' | 'lobby' | 'game' | 'end';

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
  players: Player[];
  maxPlayers: number;
  difficulty: string;
  status: string;
}

const App = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [currentDilema, setCurrentDilema] = useState<Dilema | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{ currentDilemaIndex: number; totalDilemas: number } | null>(null);
  const [playerScores, setPlayerScores] = useState<Player[]>([]);
  const [finalRanking, setFinalRanking] = useState<Player[]>([]);

  // Initialize Socket.io
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://caminho-dos-valores.onrender.com';
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado ao backend');
    });

    newSocket.on('rooms_updated', (updatedRooms: Room[]) => {
      setRooms(updatedRooms);
    });

    newSocket.on('game_started', (data: { dilema: Dilema; roomInfo: any }) => {
      setCurrentDilema(data.dilema);
      setRoomInfo(data.roomInfo);
      setScreen('game');
    });

    newSocket.on('next_dilema', (data: { dilema: Dilema; roomInfo: any; playerScores: Player[] }) => {
      setShowAnalysis(false);
      setSelectedOption(null);
      setCurrentDilema(data.dilema);
      setRoomInfo(data.roomInfo);
      setPlayerScores(data.playerScores);
    });

    newSocket.on('game_finished', (data: { ranking: Player[] }) => {
      setFinalRanking(data.ranking);
      setScreen('end');
    });

    newSocket.on('room_created', (data: { roomId: string }) => {
      // O backend já colocou o jogador na sala e emitiu rooms_updated
      // O frontend precisa apenas mudar para a tela de lobby
      setScreen('lobby');
      console.log(`Sala criada com sucesso. ID: ${data.roomId}`);
    });

    newSocket.on('error', (error: any) => {
      console.error('Erro:', error.message);
      alert(error.message);
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

  // Render Splash
  const renderSplash = () => {
    return (
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
  const renderMenu = () => {
    return (
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
            marginBottom: '40px',
            color: '#FFD93D',
            fontSize: '18px',
            textAlign: 'center',
          }}>
            O Caminho dos Valores é um jogo de dilemas éticos e morais.
          </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}>
          <button
            onClick={() => {
              if (playerName.trim() && socket) {
                socket.emit('register_player', { name: playerName });
                socket.emit('create_room', { playerName, maxPlayers: 4, difficulty: 'médio' });
              }
            }}
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
          >
            Entrar em Sala
          </button>
        </div>
      </div>
    </div>
  );

  // Render Lobby
  const renderLobby = () => {
    return (
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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '1000px',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input
            type="text"
            placeholder="Código da Sala"
            value={roomIdToJoin}
            onChange={(e) => setRoomIdToJoin(e.target.value)}
            style={{
              flexGrow: 1,
              padding: '15px 20px',
              fontSize: '18px',
              fontFamily: 'Poppins, sans-serif',
              border: '2px solid #FFD93D',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#2D1B69',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => {
              if (playerName.trim() && socket && roomIdToJoin.trim()) {
                socket.emit('register_player', { name: playerName });
                socket.emit('join_room', { roomId: roomIdToJoin, playerName });
              }
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
            }}
          >
            Entrar por Código
          </button>
        </div>

        <h2 style={{ color: '#FFD93D', marginBottom: '10px', textAlign: 'center' }}>Salas Abertas</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          width: '100%',
        }}>
          {rooms.map((room) => (
            <div key={room.id} style={{
            backgroundColor: 'rgba(108, 99, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #FFD93D',
            cursor: 'pointer',
          }}>
            <h3 style={{ color: '#FFD93D', marginBottom: '10px' }}>{room.name}</h3>
            <p style={{ color: '#FFFFFF', marginBottom: '5px' }}>
              Jogadores: {room.players.length}/{room.maxPlayers}
            </p>
            <p style={{ color: '#FFFFFF', marginBottom: '15px' }}>
              Dificuldade: {room.difficulty}
            </p>
            <button
              onClick={() => {
                if (playerName.trim() && socket) {
                  socket.emit('register_player', { name: playerName });
                  socket.emit('join_room', { roomId: room.id, playerName });
                  setCurrentRoom(room);
                }
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
  const renderGame = () => {
    return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#2D1B69',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {currentDilema && !showAnalysis && (
        <div style={{
          maxWidth: '800px',
          width: '100%',
        }}>
          <div style={{
            marginBottom: '20px',
            color: '#FFD93D',
            fontSize: '14px',
          }}>
            Dilema {roomInfo?.currentDilemaIndex} de {roomInfo?.totalDilemas}
          </div>

          <h1 style={{
            color: '#FFD93D',
            fontSize: '32px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {currentDilema.title}
          </h1>

          <div style={{
            backgroundColor: 'rgba(108, 99, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px solid #FFD93D',
          }}>
            <p style={{
              color: '#FFFFFF',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '15px',
            }}>
              {currentDilema.description}
            </p>
            <p style={{
              color: '#FFD93D',
              fontSize: '14px',
              fontStyle: 'italic',
            }}>
              {currentDilema.context}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '15px',
          }}>
            {currentDilema.options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOption(option);
                  setShowAnalysis(true);
                  if (socket && currentRoom) {
                    socket.emit('answer_dilema', {
                      roomId: currentRoom.id,
                      dilemaId: currentDilema.id,
                      optionId: option.id,
                    });
                  }
                }}
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
                  textAlign: 'left',
                }}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {showAnalysis && selectedOption && (
        <div style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}>
          <h2 style={{
            color: '#FFD93D',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            Análise da Sua Resposta
          </h2>

          <div style={{
            backgroundColor: 'rgba(108, 99, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #FFD93D',
          }}>
            <p style={{
              color: '#FFFFFF',
              fontSize: '16px',
              lineHeight: '1.6',
            }}>
              {selectedOption.feedback}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px',
          }}>
            <div style={{
              backgroundColor: 'rgba(108, 99, 255, 0.2)',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #FFD93D',
            }}>
              <h3 style={{ color: '#FFD93D', marginBottom: '10px' }}>Análise Ética</h3>
              {selectedOption.ethicalAnalysis.map((analysis, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <p style={{ color: '#FFFFFF', margin: '5px 0' }}>
                    <strong>{analysis.framework}</strong>: {analysis.score}/100
                  </p>
                  <p style={{ color: '#DDD', fontSize: '12px', margin: '0' }}>
                    {analysis.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: 'rgba(108, 99, 255, 0.2)',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #FFD93D',
            }}>
              <h3 style={{ color: '#FFD93D', marginBottom: '10px' }}>Valores Corporativos</h3>
              {selectedOption.valueAnalysis.slice(0, 5).map((value, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <p style={{ color: '#FFFFFF', margin: '3px 0', fontSize: '14px' }}>
                    <strong>{value.value}</strong>: {value.alignment > 0 ? '+' : ''}{value.alignment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            color: '#FFD93D',
            fontSize: '18px',
            marginBottom: '20px',
          }}>
            Pontuação: <strong>{selectedOption.overallScore}</strong>
          </div>

          {playerScores.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(108, 99, 255, 0.2)',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #FFD93D',
              marginBottom: '20px',
            }}>
              <h3 style={{ color: '#FFD93D', marginBottom: '10px' }}>Ranking Atual</h3>
              {playerScores.map((player, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 217, 61, 0.1)',
                  borderRadius: '5px',
                }}>
                  <span>{idx + 1}. {player.name}</span>
                  <span>{player.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render End
  const renderEnd = () => {
    return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#2D1B69',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'Poppins, sans-serif',
      overflow: 'auto',
    }}>
      <h1 style={{
        color: '#FFD93D',
        fontSize: '48px',
        marginBottom: '30px',
      }}>
        🏆 Jogo Finalizado!
      </h1>

      <div style={{
        maxWidth: '600px',
        width: '100%',
        marginBottom: '30px',
      }}>
        <h2 style={{
          color: '#FFD93D',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          Ranking Final
        </h2>

        {finalRanking.map((player, idx) => (
          <div key={idx} style={{
            backgroundColor: idx === 0 ? 'rgba(255, 217, 61, 0.2)' : 'rgba(108, 99, 255, 0.2)',
            padding: '20px',
            marginBottom: '15px',
            borderRadius: '10px',
            border: `2px solid ${idx === 0 ? '#FFD93D' : '#6C63FF'}`,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <h3 style={{ color: '#FFD93D', margin: 0 }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`} {player.name}
              </h3>
              <span style={{ color: '#FFD93D', fontSize: '24px', fontWeight: 'bold' }}>
                {player.score} pts
              </span>
            </div>

            {player.ethicalProfile && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
              }}>
                <p style={{ color: '#DDD', margin: '5px 0' }}>
                  <strong>Perfil Ético:</strong> {player.ethicalProfile.dominantFramework}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '5px',
                  color: '#DDD',
                }}>
                  <span>Utilitarismo: {player.ethicalProfile.utilitarismo}</span>
                  <span>Deontologia: {player.ethicalProfile.deontologia}</span>
                  <span>Virtude: {player.ethicalProfile.virtude}</span>
                  <span>Consequencialismo: {player.ethicalProfile.consequencialismo}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setScreen('menu');
          setPlayerName('');
          setCurrentDilema(null);
          setSelectedOption(null);
          setShowAnalysis(false);
          setPlayerScores([]);
          setFinalRanking([]);
        }}
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
  const renderScreen = () => {
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

  return renderScreen();
};

export default App;
