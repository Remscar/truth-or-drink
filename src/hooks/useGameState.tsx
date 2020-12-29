import React from "react";
import { CouldError, getLogger, Maybe } from "../util";

import {
  CompleteGameStateDto,
  CreatedDto,
  CreateDto,
  JoinDto,
  JoinedDto,
  PlayerInfo,
} from "../shared";
import { useSocket } from "./useSocket";

export * from "./useGameStateHelpers";

const logger = getLogger("hooks:useGameState");

export interface GameState {
  gameCode: string;
  started: boolean;
  players: PlayerInfo[];
  isOwner: boolean;
}

export interface GameStateContext {
  currentGame: Maybe<GameState>;
  playerInfo: Maybe<PlayerInfo>;
  createGame: (player: PlayerInfo) => Promise<string>;
  joinGame: (
    player: PlayerInfo,
    gameCode: string
  ) => Promise<CouldError<boolean>>;
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
  if (!context || !context.currentGame) {
    throw Error("Game Session Not ready");
  }
  return context;
};

export const useRawGameState = () => {
  const context = React.useContext(gameStateContext);
  return context;
};

export const GameStateContextProvider: React.FC = (props) => {
  const gameSocket = useSocket();
  const [currentGameState, setCurrentGameState] = React.useState<Maybe<GameState>>(null);
  const [playerInfo, setPlayerInfo] = React.useState<Maybe<PlayerInfo>>(null);


  gameSocket.on("connect", () => {
    logger.log("client connected");
  });

  gameSocket.on("completeGameState", (data: CompleteGameStateDto) => {
    console.log(currentGameState);

    logger.log(`Received full state for ${data.gameCode}`);

    if (currentGameState && data.gameCode !== currentGameState.gameCode) {
      logger.warn(
        `Received a game state for a game we aren't in? ${currentGameState.gameCode} vs received ${data.gameCode}`
      );
    }

    logger.log(data);

    setCurrentGameState({
      gameCode: data.gameCode,
      started: data.started,
      players: data.players,
      isOwner: data.owner === gameSocket.id,
    });
  });

  const getSocket = async () => {
    return gameSocket;
  };

  const joinGame = async (player: PlayerInfo, gameCode: string) => {
    const socket = await getSocket();
    const dto: JoinDto = {
      player,
      gameCode,
    };

    socket.emit("join", dto);

    return new Promise<CouldError<boolean>>((resolve) => {
      socket.once("joined", (data: JoinedDto) => {
        logger.log(
          `Was ${data.success ? null : "not"} successful joining ${gameCode}`
        );

        if (data.success) {
          setCurrentGameState({
            gameCode,
            started: false,
            players: [],
            isOwner: false,
          });
          setPlayerInfo(player);
        }

        resolve({
          value: data.success,
          error: data.error,
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
        setCurrentGameState({
          gameCode: data.gameCode,
          started: false,
          players: [player],
          isOwner: true,
        });
        setPlayerInfo(player);

        resolve(data.gameCode);
      });
    });
  };

  
  const memoValue = React.useMemo(
    () => ({
      currentGame: currentGameState,
      playerInfo: playerInfo,
      joinGame,
      createGame,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentGameState]
  );

  let contextValue: Maybe<GameStateContext> = memoValue;


  return (
    <gameStateContext.Provider value={contextValue}>
      {props.children}
    </gameStateContext.Provider>
  );
};
