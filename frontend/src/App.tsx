import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, Dilema, Option, Player } from '../../backend/src/types/types';

type Screen = 'splash' | 'menu' | 'lobby' | 'room_lobby' | 'game' | 'end';

const App = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<string>('médio');
  const [gameMode, setGameMode] = useState<'Padrão' | 'Rápido' | 'Personalizado'>('Padrão');
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomIdToJoin, setRoomIdToJoin] = useState<string>('');
  const [currentDilema, setCurrentDilema] = useState<Dilema | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<{ currentDilemaIndex: number; totalDilemas: number } | null>(null);
  const [playerScores, setPlayerScores] = useState<Player[]>([]);
  const [finalRanking, setFinalRanking] = useState<Player[]>([]);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://caminho-dos-valores.onrender.com';
    const newSocket = io(backendUrl, { reconnection: true });

    newSocket.on('connect', () => {
      console.log('✅ Conectado ao backend');
    });

    newSocket.on('rooms_updated', (updatedRooms: Room[]) => {
      setRooms(updatedRooms);
    });

    newSocket.on('room_updated', (room: Room) => {
      setCurrentRoom(room);
      if (room.status === 'waiting') {
        setScreen('room_lobby');
      }
    });

    newSocket.on('game_started', ({ dilema, roomInfo }: { dilema: Dilema; roomInfo: any }) => {
      setCurrentDilema(dilema);
      setRoomInfo(roomInfo);
      setScreen('game');
    });

    newSocket.on('next_dilema', ({ dilema, roomInfo, playerScores }: { dilema: Dilema; roomInfo: any; playerScores: Player[] }) => {
      setShowAnalysis(false);
      setSelectedOption(null);
      setCurrentDilema(dilema);
      setRoomInfo(roomInfo);
      setPlayerScores(playerScores);
    });

    newSocket.on('game_finished', ({ ranking }: { ranking: Player[] }) => {
      setFinalRanking(ranking);
      setScreen('end');
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

  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('menu');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

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
      <div style={{ textAlign: 'center', animation: 'fadeInScale 2s ease-in-out' }}>
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
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes glow {
          0%, 100% { textShadow: 0 0 30px rgba(255, 217, 61, 0.8), 0 0 60px rgba(108, 99, 255, 0.6); }
          50% { textShadow: 0 0 50px rgba(255, 217, 61, 1), 0 0 80px rgba(108, 99, 255, 0.8); }
        }
      `}</style>
    </div>
  );

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
        <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <label style={{ color: '#FFD93D', fontSize: '16px' }}>Máximo de Jogadores:</label>
          <input
            type="number"
            min="2"
            max="8"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #FFD93D',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#2D1B69',
            }}
          />
          <label style={{ color: '#FFD93D', fontSize: '16px' }}>Dificuldade:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #FFD93D',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#2D1B69',
            }}
          >
            <option value="fácil">Fácil</option>
            <option value="médio">Médio</option>
            <option value="difícil">Difícil</option>
          </select>
          <label style={{ color: '#FFD93D', fontSize: '16px' }}>Modo de Jogo:</label>
          <select
            value={gameMode}
            onChange={(e) => {
              const mode = e.target.value as 'Padrão' | 'Rápido' | 'Personalizado';
              setGameMode(mode);
              if (mode === 'Padrão') setTotalRounds(5);
              if (mode === 'Rápido') setTotalRounds(3);
            }}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #FFD93D',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#2D1B69',
            }}
          >
            <option value="Padrão">Padrão (5 Rodadas)</option>
            <option value="Rápido">Rápido (3 Rodadas)</option>
            <option value="Personalizado">Personalizado</option>
          </select>
          {gameMode === 'Personalizado' && (
            <>
              <label style={{ color: '#FFD93D', fontSize: '16px' }}>Total de Rodadas:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={totalRounds}
                onChange={(e) => setTotalRounds(parseInt(e.target.value) || 1)}
                style={{
                  padding: '10px 15px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #FFD93D',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#2D1B69',
                }}
              />
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ color: '#FFD93D', fontSize: '16px' }}>Sala Privada:</label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}>
          <button
            onClick={() => {
              if (playerName.trim() && socket) {
                const rounds = gameMode === 'Padrão' ? 5 : gameMode === 'Rápido' ? 3 : totalRounds;
                socket.emit('register_player', { name: playerName });
                socket.emit('create_room', { 
                  playerName, 
                  maxPlayers, 
                  difficulty,
                  gameMode, 
                  totalRounds: rounds, 
                  isPrivate 
                });
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
        textAlign: 'center',
      }}>
        Entrar em uma Sala
      </h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '400px',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input
            type="text"
            placeholder="Digite o Código da Sala (Ex: ABCD)"
            value={roomIdToJoin}
            onChange={(e) => setRoomIdToJoin(e.target.value.toUpperCase())}
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
              if (roomIdToJoin.trim() && playerName.trim() && socket) {
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
            Entrar
          </button>
        </div>
      </div>
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
          marginTop: '20px',
        }}
      >
        Voltar ao Menu
      </button>
    </div>
  );

  const renderRoomLobby = () => {
    if (!currentRoom) {
      return (
        <div style={{ color: '#FFFFFF', textAlign: 'center', padding: '50px' }}>
          Carregando informações da sala...
          <button onClick={() => setScreen('menu')}>Voltar ao Menu</button>
        </div>
      );
    }

    const isHost = socket?.id === currentRoom.creatorId;

    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#2D1B69',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        fontFamily: 'Poppins, sans-serif',
      }}>
        <h1 style={{ color: '#FFD93D', fontSize: '40px', marginBottom: '10px' }}>
          Sala: {currentRoom.name}
        </h1>
        <div style={{
          backgroundColor: 'rgba(108, 99, 255, 0.2)',
          padding: '15px 30px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '2px solid #FFD93D',
          textAlign: 'center',
        }}>
          <p style={{ color: '#FFFFFF', fontSize: '18px', margin: '0' }}>
            Código da Sala: <strong style={{ fontSize: '24px', color: '#FFD93D' }}>{currentRoom.id}</strong>
          </p>
          <p style={{ color: '#DDD', fontSize: '14px', margin: '5px 0 0 0' }}>
            Compartilhe este código para que outros jogadores entrem.
          </p>
        </div>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          marginBottom: '30px',
          textAlign: 'left',
        }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '15px' }}>
            Jogadores ({currentRoom.players.length}/{currentRoom.maxPlayers})
          </h2>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px',
            border: '1px solid #6C63FF',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}>
            {currentRoom.players.map((player, idx) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                marginBottom: '5px',
                backgroundColor: player.id === socket?.id ? 'rgba(255, 217, 61, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '5px',
              }}>
                <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                  {idx + 1}. {player.name} {player.id === socket?.id ? '(Você)' : ''}
                </span>
                {player.id === currentRoom.creatorId && (
                  <span style={{ color: '#FFD93D', fontWeight: 'bold' }}>HOST</span>
                )}
              </div>
            ))}
          </div>
        </div>
        {isHost && (
          <button
            onClick={() => {
              if (socket && currentRoom) {
                socket.emit('start_game', { roomId: currentRoom.id });
              }
            }}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: '#FFD93D',
              color: '#2D1B69',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '20px',
            }}
          >
            Começar Jogo
          </button>
        )}
        {!isHost && (
          <p style={{ color: '#FFFFFF', fontSize: '18px', marginTop: '20px' }}>
            Aguardando o Host ({currentRoom.players.find(p => p.id === currentRoom.creatorId)?.name}) iniciar o jogo...
          </p>
        )}
        <button
          onClick={() => {
            setScreen('menu');
            setCurrentRoom(null);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6C63FF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '30px',
          }}
        >
          Sair da Sala
        </button>
      </div>
    );
  };

  const renderGame = () => (
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
      <h1 style={{
        color: '#FFD93D',
        fontSize: '40px',
        marginBottom: '30px',
        textAlign: 'center',
      }}>
        {currentDilema?.title || 'Carregando Dilema...'}
      </h1>
      {currentDilema && !showAnalysis && (
        <div style={{
          maxWidth: '900px',
          width: '100%',
          marginBottom: '30px',
        }}>
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
        </div>
      )}
    </div>
  );

  return (
    <div>
      {screen === 'splash' && renderSplash()}
      {screen === 'menu' && renderMenu()}
      {screen === 'lobby' && renderLobby()}
      {screen === 'room_lobby' && renderRoomLobby()}
      {screen === 'game' && renderGame()}
      {screen === 'end' && <div>Fim do Jogo</div>}
    </div>
  );
};

export default App;