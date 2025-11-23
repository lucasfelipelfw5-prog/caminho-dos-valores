import { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

const SOCKET_URL = "https://caminho-dos-valores.onrender.com";

// --- Paleta de Cores ---
const COLORS = {
  bgPrimary: "#2D1B69",
  bgSecondary: "#1a0f3d",
  titleGold: "#FFD93D",
  textLight: "#F8F9FA",
  accentViolet: "#6C63FF",
  accentPink: "#FF6B9D",
};

// --- Tipos ---
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

interface ConfiguracaoSala {
  maxJogadores: number;
  tempoResposta: number;
  dificuldade: "facil" | "normal" | "dificil";
}

interface SalaEstado {
  salaId: string;
  jogadores: Jogador[];
  dilemaAtualId: string;
  turnoAtual: string;
  fim: boolean;
  criadorId: string;
  configuracao: ConfiguracaoSala;
}

interface Dilema {
  texto: string;
  escolhas: string[];
}

interface DilemasMap {
  [key: string]: Dilema;
}

// --- Dados ---
const DILEMAS: DilemasMap = {
  d1: { texto: "Você encontra uma carteira com R$ 800 e documentos na rua. O que faz?", escolhas: ["Procura o dono imediatamente", "Fica com o dinheiro"] },
  d2: { texto: "Seu chefe pede pra você mentir pro cliente sobre o prazo.", escolhas: ["Fala a verdade", "Segue a ordem"] },
  d3: { texto: "Um colega está sendo injustiçado no trabalho.", escolhas: ["Defende ele", "Fica quieto"] },
  d4: { texto: "Produto lucrativo que polui um pouco o meio ambiente.", escolhas: ["Lança mesmo assim", "Desiste do lucro"] },
  d5: { texto: "Seu melhor amigo pergunta se a roupa está boa (e está horrível).", escolhas: ["Diz a verdade", "Mente pra não magoar"] },
};

// --- Componente Logo ---
const GameLogo = ({ size = "lg" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: 40,
    md: 56,
    lg: 72,
  };

  return (
    <div 
      style={{
        fontSize: `${sizes[size]}px`,
        fontWeight: 900,
        textAlign: "center",
        background: "linear-gradient(to right, #FFE66D, #FF8AB5, #B19FFF)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: "-0.02em",
        margin: 0,
        padding: 0,
      }}
    >
      Caminho dos Valores
    </div>
  );
};

// --- Componente Bloco Interativo ---
const InteractiveBlock = ({ 
  title, 
  icon, 
  onClick, 
  variant = "violet",
  disabled = false 
}: { 
  title: string; 
  icon?: string; 
  onClick?: () => void; 
  variant?: "violet" | "pink" | "gold";
  disabled?: boolean;
}) => {
  const gradients = {
    violet: "linear-gradient(135deg, #6C63FF 0%, #8B7FFF 100%)",
    pink: "linear-gradient(135deg, #FF6B9D 0%, #FF8AB5 100%)",
    gold: "linear-gradient(135deg, #FFD93D 0%, #FFE66D 100%)",
  };

  const textColor = variant === "gold" ? "#2D1B69" : "#FFFFFF";
  const shadowColor = variant === "violet" ? "rgba(108, 99, 255, 0.3)" : variant === "pink" ? "rgba(255, 107, 157, 0.3)" : "rgba(255, 217, 61, 0.3)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "24px 32px",
        background: gradients[variant],
        border: "none",
        borderRadius: "24px",
        fontSize: "20px",
        fontWeight: 700,
        color: textColor,
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: "-0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: `0 8px 24px ${shadowColor}`,
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 32px ${shadowColor}`;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${shadowColor}`;
      }}
    >
      {icon && <span style={{ fontSize: "28px" }}>{icon}</span>}
      <span>{title}</span>
    </button>
  );
};

// --- Tela Inicial ---
const InitialScreen = ({ setTela }: any) => (
  <div 
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      background: `linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%)`,
      fontFamily: "'Poppins', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: "40px", left: "40px", width: "192px", height: "192px", background: "#6C63FF", borderRadius: "50%", opacity: 0.1, filter: "blur(48px)" }}></div>
    <div style={{ position: "absolute", bottom: "40px", right: "40px", width: "192px", height: "192px", background: "#FF6B9D", borderRadius: "50%", opacity: 0.1, filter: "blur(48px)" }}></div>

    <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "960px" }}>
      <div style={{ marginBottom: "80px" }}>
        <GameLogo size="lg" />
      </div>

      <p 
        style={{
          fontSize: "32px",
          fontWeight: 300,
          marginBottom: "96px",
          lineHeight: 1.6,
          color: COLORS.textLight,
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        Descubra seu perfil moral e ético em um jogo de dilemas e escolhas
      </p>

      <div style={{ marginBottom: "96px" }}>
        <InteractiveBlock
          title="Iniciar Jornada"
          icon="🚀"
          onClick={() => setTela("lobby")}
          variant="gold"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div 
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              background: COLORS.accentViolet,
              color: "white",
            }}
          >
            ✓
          </div>
          <span style={{ color: COLORS.textLight, fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 500 }}>
            Tela Inicial
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div 
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              background: COLORS.accentPink,
              color: "white",
            }}
          >
            ✓
          </div>
          <span style={{ color: COLORS.textLight, fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 500 }}>
            Blocos Interativos
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div 
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              background: COLORS.titleGold,
              color: COLORS.bgPrimary,
            }}
          >
            ✓
          </div>
          <span style={{ color: COLORS.textLight, fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 500 }}>
            Bug Corrigido
          </span>
        </div>
      </div>
    </div>
  </div>
);

// --- Tela Lobby com Configuração ---
const LobbyScreen = ({ 
  nome, 
  setNome, 
  salaId, 
  setSalaId, 
  maxJogadores,
  setMaxJogadores,
  dificuldade,
  setDificuldade,
  criarSala, 
  entrarNaSala 
}: any) => {
  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background: `linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%)`,
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "80px", right: "80px", width: "160px", height: "160px", background: "#6C63FF", borderRadius: "50%", opacity: 0.1, filter: "blur(48px)" }}></div>
      <div style={{ position: "absolute", bottom: "80px", left: "80px", width: "160px", height: "160px", background: "#FF6B9D", borderRadius: "50%", opacity: 0.1, filter: "blur(48px)" }}></div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", width: "100%" }}>
        <div style={{ marginBottom: "96px", textAlign: "center" }}>
          <GameLogo size="md" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "64px" }}>
          {/* Criar Sala */}
          <div 
            style={{
              padding: "64px",
              borderRadius: "24px",
              border: `2px solid ${COLORS.accentViolet}`,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              boxShadow: `0 8px 32px rgba(108, 99, 255, 0.15)`,
              transition: "all 0.3s ease",
            }}
          >
            <div 
              style={{
                fontSize: "40px",
                fontWeight: 700,
                marginBottom: "48px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                color: COLORS.titleGold,
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              <span>✨</span>
              Criar Sala
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Seu Nome
              </label>
              <input
                key="nome-criar"
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Máximo de Jogadores
              </label>
              <select
                value={maxJogadores}
                onChange={(e) => setMaxJogadores(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  boxSizing: "border-box",
                }}
              >
                <option value={2} style={{ background: COLORS.bgPrimary }}>2 Jogadores</option>
                <option value={3} style={{ background: COLORS.bgPrimary }}>3 Jogadores</option>
                <option value={4} style={{ background: COLORS.bgPrimary }}>4 Jogadores</option>
                <option value={5} style={{ background: COLORS.bgPrimary }}>5 Jogadores</option>
                <option value={6} style={{ background: COLORS.bgPrimary }}>6 Jogadores</option>
              </select>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Dificuldade
              </label>
              <select
                value={dificuldade}
                onChange={(e) => setDificuldade(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  boxSizing: "border-box",
                }}
              >
                <option value="facil" style={{ background: COLORS.bgPrimary }}>Fácil</option>
                <option value="normal" style={{ background: COLORS.bgPrimary }}>Normal</option>
                <option value="dificil" style={{ background: COLORS.bgPrimary }}>Difícil</option>
              </select>
            </div>

            <InteractiveBlock
              title="Criar Sala"
              icon="🎮"
              onClick={criarSala}
              variant="violet"
            />
          </div>

          {/* Entrar Sala */}
          <div 
            style={{
              padding: "64px",
              borderRadius: "24px",
              border: `2px solid ${COLORS.accentPink}`,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              boxShadow: `0 8px 32px rgba(255, 107, 157, 0.15)`,
              transition: "all 0.3s ease",
            }}
          >
            <div 
              style={{
                fontSize: "40px",
                fontWeight: 700,
                marginBottom: "48px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                color: COLORS.titleGold,
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              <span>🚪</span>
              Entrar em Sala
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Seu Nome
              </label>
              <input
                key="nome-entrar"
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "32px" }}>
              <label style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                ID da Sala
              </label>
              <input
                type="text"
                placeholder="Cole o ID da sala"
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <InteractiveBlock
              title="Entrar"
              icon="🔑"
              onClick={entrarNaSala}
              variant="pink"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Tela Aguardando com Painel do Criador ---
const WaitingScreen = ({ 
  minhaSalaId, 
  jogadores, 
  isCriador, 
  onRemoverJogador,
  onComecaJogo,
  configuracao
}: any) => (
  <div 
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "64px",
      padding: "32px",
      background: `linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%)`,
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    <div 
      style={{
        fontSize: "56px",
        fontWeight: 900,
        textAlign: "center",
        color: COLORS.titleGold,
        letterSpacing: "-0.02em",
      }}
    >
      Sala: {minhaSalaId}
    </div>

    <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
      <div style={{ padding: "16px 24px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "12px", border: `1px solid ${COLORS.accentViolet}` }}>
        <span style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600 }}>👥 Jogadores: </span>
        <span style={{ color: COLORS.titleGold, fontSize: "18px", fontWeight: 700 }}>{jogadores.length}/{configuracao.maxJogadores}</span>
      </div>
      <div style={{ padding: "16px 24px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "12px", border: `1px solid ${COLORS.accentViolet}` }}>
        <span style={{ color: COLORS.textLight, fontSize: "14px", fontWeight: 600 }}>⚡ Dificuldade: </span>
        <span style={{ color: COLORS.titleGold, fontSize: "18px", fontWeight: 700, textTransform: "capitalize" }}>{configuracao.dificuldade}</span>
      </div>
    </div>

    <p 
      style={{
        fontSize: "32px",
        fontWeight: 300,
        color: COLORS.textLight,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      Aguardando jogadores...
    </p>

    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px", width: "100%" }}>
      {jogadores.map((j: Jogador) => (
        <div 
          key={j.id} 
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 32px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.1)",
            color: COLORS.textLight,
            backdropFilter: "blur(10px)",
            border: `2px solid ${COLORS.accentViolet}`,
            fontFamily: "'Poppins', sans-serif",
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          <span>👤 {j.nome}</span>
          {isCriador && (
            <button
              onClick={() => onRemoverJogador(j.id)}
              style={{
                padding: "8px 16px",
                background: "rgba(255, 107, 157, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#FF6B9D";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 107, 157, 0.8)";
              }}
            >
              ✕ Remover
            </button>
          )}
        </div>
      ))}
    </div>

    {isCriador && (
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <InteractiveBlock
          title="Começar Jogo"
          icon="▶️"
          onClick={onComecaJogo}
          variant="gold"
          disabled={jogadores.length < 2}
        />
        {jogadores.length < 2 && (
          <p style={{ color: COLORS.titleGold, textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
            ⚠️ Mínimo 2 jogadores para começar
          </p>
        )}
      </div>
    )}

    {!isCriador && (
      <p 
        style={{
          fontSize: "18px",
          color: COLORS.textLight,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 300,
        }}
      >
        Aguarde o criador da sala iniciar o jogo...
      </p>
    )}
  </div>
);

// --- Tela Jogo ---
const GameScreen = ({ minhaSalaId, jogadores, dilemaTexto, meuTurno, fazerEscolha }: any) => (
  <div 
    style={{
      minHeight: "100vh",
      padding: "48px",
      background: `linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%)`,
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div 
        style={{
          fontSize: "48px",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "64px",
          color: COLORS.titleGold,
          letterSpacing: "-0.02em",
        }}
      >
        🎮 Sala: {minhaSalaId}
      </div>

      <div 
        style={{
          borderRadius: "24px",
          padding: "48px",
          marginBottom: "64px",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.05)",
          border: `2px solid ${COLORS.accentViolet}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "48px" }}>
          {jogadores.map((j: Jogador) => (
            <div key={j.id} style={{ textAlign: "center" }}>
              <div 
                style={{
                  fontSize: "24px",
                  marginBottom: "16px",
                  fontWeight: 700,
                  color: COLORS.textLight,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {j.nome}
              </div>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>
                🏃
              </div>
              <div 
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  color: COLORS.titleGold,
                  letterSpacing: "-0.02em",
                }}
              >
                {j.posicao + 1}/15
              </div>
            </div>
          ))}
        </div>
      </div>

      <div 
        style={{
          borderRadius: "24px",
          padding: "64px",
          marginBottom: "48px",
          background: "rgba(255, 255, 255, 0.05)",
          border: `2px solid ${COLORS.accentPink}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <p 
          style={{
            fontSize: "40px",
            textAlign: "center",
            marginBottom: "64px",
            fontWeight: 300,
            lineHeight: 1.6,
            color: COLORS.textLight,
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          ❓ {dilemaTexto.texto}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "960px", margin: "0 auto" }}>
          {dilemaTexto.escolhas.map((opcao: string, i: number) => (
            <button
              key={i}
              onClick={() => fazerEscolha(i)}
              disabled={!meuTurno}
              style={{
                width: "100%",
                padding: "32px 32px",
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "16px",
                border: "none",
                background: meuTurno
                  ? `linear-gradient(135deg, ${COLORS.accentViolet} 0%, ${COLORS.accentPink} 100%)`
                  : "rgba(100, 100, 100, 0.3)",
                color: COLORS.textLight,
                cursor: meuTurno ? "pointer" : "not-allowed",
                opacity: meuTurno ? 1 : 0.6,
                boxShadow: meuTurno ? `0 8px 24px rgba(108, 99, 255, 0.3)` : "none",
                fontFamily: "'Poppins', sans-serif",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (meuTurno) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              {meuTurno ? `✓ ${opcao}` : "⏳ Aguardando outro jogador..."}
            </button>
          ))}
        </div>
        {!meuTurno && (
          <p 
            style={{
              textAlign: "center",
              fontSize: "24px",
              marginTop: "48px",
              fontWeight: 600,
              color: COLORS.titleGold,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            ⏰ Aguarde sua vez!
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px" }}>
        {jogadores.map((j: Jogador) => (
          <div 
            key={j.id} 
            style={{
              borderRadius: "24px",
              padding: "32px",
              background: "rgba(255, 255, 255, 0.05)",
              border: `2px solid ${COLORS.accentViolet}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "24px",
                textAlign: "center",
                color: COLORS.titleGold,
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {j.nome}
            </h3>
            {Object.entries(j.valores).map(([chave, valor]) => (
              <div 
                key={chave} 
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "16px",
                  marginBottom: "12px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <span style={{ color: COLORS.textLight, textTransform: "capitalize", fontWeight: 500 }}>
                  {chave}
                </span>
                <span style={{ color: valor >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                  {valor > 0 ? "+" : ""}{valor}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Tela Fim ---
const EndScreen = ({ jogadores }: any) => (
  <div 
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      background: `linear-gradient(135deg, #FFD93D 0%, ${COLORS.accentPink} 100%)`,
      fontFamily: "'Poppins', sans-serif",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div 
        style={{
          fontSize: "72px",
          fontWeight: 900,
          marginBottom: "80px",
          color: COLORS.bgPrimary,
          letterSpacing: "-0.02em",
        }}
      >
        🏆 JOGO TERMINADO!
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px", marginTop: "64px", maxWidth: "1200px", margin: "64px auto 0" }}>
        {jogadores.map((j: Jogador) => (
          <div 
            key={j.id} 
            style={{
              borderRadius: "24px",
              padding: "40px",
              background: "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(10px)",
              border: `2px solid ${COLORS.bgPrimary}`,
            }}
          >
            <p 
              style={{
                fontSize: "32px",
                fontWeight: 700,
                marginBottom: "32px",
                color: COLORS.bgPrimary,
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {j.nome}
            </p>
            {Object.entries(j.valores).map(([k, v]) => (
              <p 
                key={k} 
                style={{
                  fontSize: "18px",
                  marginBottom: "12px",
                  fontWeight: 500,
                  color: COLORS.bgPrimary,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {k}: <span style={{ color: v >=0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                  {v > 0 ? "+" : ""}{v}
                </span>
              </p>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "80px",
          paddingLeft: "64px",
          paddingRight: "64px",
          paddingTop: "32px",
          paddingBottom: "32px",
          background: "white",
          color: COLORS.bgPrimary,
          fontSize: "20px",
          fontWeight: 900,
          border: "none",
          borderRadius: "50px",
          cursor: "pointer",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "-0.01em",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        🔄 Jogar Novamente
      </button>
    </div>
  </div>
);

// --- App Principal ---
export default function App() {
  const [tela, setTela] = useState<"inicial" | "lobby" | "aguardando" | "jogo" | "fim">("inicial");
  const [nome, setNome] = useState("");
  const [salaId, setSalaId] = useState("");
  const [maxJogadores, setMaxJogadores] = useState(2);
  const [dificuldade, setDificuldade] = useState("normal");
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [dilemaAtualId, setDilemaAtualId] = useState<string | null>(null);
  const [meuTurno, setMeuTurno] = useState(false);
  const [minhaSalaId, setMinhaSalaId] = useState("");
  const [isCriador, setIsCriador] = useState(false);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoSala>({
    maxJogadores: 2,
    tempoResposta: 30,
    dificuldade: "normal",
  });

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("sala-criada", (data: { salaId: string; criadorId: string; configuracao: ConfiguracaoSala }) => {
      setMinhaSalaId(data.salaId);
      setIsCriador(true);
      setConfiguracao(data.configuracao);
      setTela("aguardando");
    });

    newSocket.on("entrou-sala", (estado: SalaEstado) => {
      setJogadores(estado.jogadores);
      setMinhaSalaId(estado.salaId);
      setIsCriador(newSocket.id === estado.criadorId);
      setConfiguracao(estado.configuracao);
      setTela("aguardando");
    });

    newSocket.on("jogadores-atualizados", (data: { jogadores: Jogador[]; configuracao: ConfiguracaoSala }) => {
      setJogadores(data.jogadores);
      setConfiguracao(data.configuracao);
    });

    newSocket.on("estado-atualizado", (estado: SalaEstado) => {
      setJogadores(estado.jogadores);
      setDilemaAtualId(estado.dilemaAtualId);

      const meuJogador = estado.jogadores.find((j) => j.id === newSocket.id);
      setMeuTurno(meuJogador?.id === estado.turnoAtual);

      if (estado.fim) setTela("fim");
      else setTela("jogo");
    });

    newSocket.on("erro-sala", (msg) => alert(msg));

    return () => {
      newSocket.close();
    };
  }, []);

  const criarSala = () => {
    if (!nome.trim()) return alert("Digite seu nome!");
    socket?.emit("criar-sala", { 
      nome: nome.trim(),
      configuracao: {
        maxJogadores,
        tempoResposta: 30,
        dificuldade,
      }
    });
  };

  const entrarNaSala = () => {
    if (!nome.trim() || !salaId.trim()) return alert("Preencha nome e ID da sala");
    socket?.emit("entrar-sala", { salaId: salaId.trim(), nome: nome.trim() });
  };

  const removerJogador = (jogadorId: string) => {
    socket?.emit("remover-jogador", { salaId: minhaSalaId, jogadorId });
  };

  const comecarJogo = () => {
    socket?.emit("comeca-jogo", { salaId: minhaSalaId });
  };

  const fazerEscolha = (index: number) => {
    if (!meuTurno) return;
    socket?.emit("escolha", { salaId: minhaSalaId, escolhaIndex: index });
  };

  const dilemaTexto = useMemo<Dilema>(() => {
    if (!dilemaAtualId) {
      return { texto: "Aguardando próximo dilema...", escolhas: [] };
    }
    return DILEMAS[dilemaAtualId as keyof DilemasMap] || { texto: "Dilema não encontrado.", escolhas: [] };
  }, [dilemaAtualId]);

  switch (tela) {
    case "inicial":
      return <InitialScreen setTela={setTela} />;
    case "lobby":
      return (
        <LobbyScreen
          nome={nome}
          setNome={setNome}
          salaId={salaId}
          setSalaId={setSalaId}
          maxJogadores={maxJogadores}
          setMaxJogadores={setMaxJogadores}
          dificuldade={dificuldade}
          setDificuldade={setDificuldade}
          criarSala={criarSala}
          entrarNaSala={entrarNaSala}
        />
      );
    case "aguardando":
      return (
        <WaitingScreen 
          minhaSalaId={minhaSalaId} 
          jogadores={jogadores}
          isCriador={isCriador}
          onRemoverJogador={removerJogador}
          onComecaJogo={comecarJogo}
          configuracao={configuracao}
        />
      );
    case "jogo":
      return (
        <GameScreen
          minhaSalaId={minhaSalaId}
          jogadores={jogadores}
          dilemaTexto={dilemaTexto}
          meuTurno={meuTurno}
          fazerEscolha={fazerEscolha}
        />
      );
    case "fim":
      return <EndScreen jogadores={jogadores} />;
    default:
      return <InitialScreen setTela={setTela} />;
  }
}
