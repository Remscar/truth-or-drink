import React from "react";
import { CouldError, getLogger, Maybe, Socket } from "../util";

import openSocket from "socket.io-client";
import { CompleteGameStateDto, CreatedDto, CreateDto, JoinDto, JoinedDto, PlayerInfo } from "../shared";

export * from "./useGameStateHelpers";

const logger = getLogger("hooks:useGameState");

export interface GameState {
  gameCode: string;
  started: boolean;
  players: PlayerInfo[];
}

export interface GameStateContext {
  state: GameState;
  rawSocket: Socket;
  createGame: (player: PlayerInfo) => Promise<string>;
  joinGame: (player: PlayerInfo, gameCode: string) => Promise<CouldError<boolean>>;
}

const gameStateContext = React.createContext<Maybe<GameStateContext>>(null);

export const useGameState = () => {
  const context = React.useContext(gameStateContext);
  if (!context) {
    throw Error("Game State Not ready");
  }
  return context;
};

export const useStartedGameState = () => {
  const context = React.useContext(gameStateContext);
  if (!context || !context.state) {
    throw Error("Game Session Not ready");
  }
  return context;
};

export const useRawGameState = () => {
  const context = React.useContext(gameStateContext);
  return context;
};

export const GameStateContextProvider: React.FC = (props) => {
  const [rawSocket, setSocket] = React.useState<Socket>(
    (null as unknown) as Socket
  );
  const [gameState, setGameState] = React.useState<GameState>({} as GameState);

  React.useEffect(() => {
    if (!rawSocket) {
      logger.log(`Creating socket connection`);

      const host = window.location.origin;
      const gameSocket = openSocket(host, { path: "/socket" });
      gameSocket.on("connect", () => {
        logger.log("client connected");
      });

      gameSocket.on("completeGameState", (data: CompleteGameStateDto) => {
        logger.log(`Received full state for ${data.gameCode}`);

        if (data.gameCode !== gameState.gameCode) {
          logger.error(`Received a game state for a game we aren't in? ${gameState.gameCode} vs received ${data.gameCode}`);
          return;
        }

        setGameState({
          gameCode: data.gameCode,
          started: data.started,
          players: data.players
        });
      });

      setSocket(gameSocket);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSocket]);

  const getSocket = async () => {
    if (!rawSocket) {
      throw Error(`Socket not ready.`);
    }

    return rawSocket;
  };

  const joinGame = async (player: PlayerInfo, gameCode: string) => {
    const socket = await getSocket();
    const dto: JoinDto = {
      player,
      gameCode
    }

    socket.emit('join', dto);

    return new Promise<CouldError<boolean>>((resolve) => {
      socket.once('joined', (data: JoinedDto) => {
        logger.log(`Was ${data.success ? null : 'not'} successful joining ${gameCode}`);

        if (data.success) {
          setGameState({
            gameCode,
            started: false,
            players: []
          });
        }

        resolve({
          value: data.success,
          error: data.error
        });
      });
    });
  };

  const createGame = async (player: PlayerInfo) => {
    logger.log(`Creating game for ${player.name}`);

    const socket = await getSocket();
    const dto: CreateDto = {
      creator: player,
    };
    socket.emit("create", dto);

    return new Promise<string>((resolve) => {
      socket.once("created", (data: CreatedDto) => {

        logger.log(`Server created our game with code: ${data.gameCode}`);
        setGameState({
          gameCode: data.gameCode,
          started: false,
          players: [player]
        });

        resolve(data.gameCode);
      });
    });
  };

  let contextValue: Maybe<GameStateContext> = null;

  const memoValue = React.useMemo(
    () => ({
      state: gameState,
      rawSocket,
      joinGame,
      createGame,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawSocket, gameState]
  );

  if (rawSocket) {
    contextValue = memoValue;
  }

  return (
    <gameStateContext.Provider value={contextValue}>
      {props.children}
    </gameStateContext.Provider>
  );
};

