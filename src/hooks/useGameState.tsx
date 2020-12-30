import React from "react";
import { CouldError, getLogger, Maybe } from "../util";

import {
  ChoseQuestionDto,
  CompleteGameStateDto,
  CreatedDto,
  CreateDto,
  JoinDto,
  JoinedDto,
  LeaveGameDto,
  PlayerAnsweredDto,
  PlayerAnswerLikedDto,
  PlayerChoseWinnerDto,
  PlayerInfo,
  PlayerStartNextRound,
  SelectedPlayersDto,
  ToDGameState,
} from "../shared";
import { useSocket } from "./useSocket";

export * from "./useGameStateHelpers";

const logger = getLogger("hooks:useGameState");

export interface GameState extends ToDGameState {
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
  leaveGame: () => Promise<void>;
  startGame: () => void;
  choosePlayers: (players: PlayerInfo[]) => Promise<void>;
  choseQuestion: (index: number) => Promise<void>;
  playerAnsweredQuestion: (didAnswer: boolean) => Promise<void>;
  choseWinner: (winner: PlayerInfo) => Promise<void>;
  startNewRound: () => Promise<void>;
  likeAnswer: (player: PlayerInfo) => Promise<void>;
}

const gameStateContext = React.createContext<Maybe<GameStateContext>>(null);

export const useGameState = () => {
  const context = React.useContext(gameStateContext);
  if (!context) {
    throw Error("Game State Not ready");
  }
  return context;
};

export const useCurrentGameState = () => {
  const context = React.useContext(gameStateContext);
  if (!context || !context.currentGame) {
    throw Error("Game Session Not ready");
  }
  return context.currentGame;
};

export const useRawGameState = () => {
  const context = React.useContext(gameStateContext);
  return context;
};

export const GameStateContextProvider: React.FC = (props) => {
  const gameSocket = useSocket();
  const [currentGameState, setCurrentGameState] = React.useState<Maybe<GameState>>(null);
  const [playerInfo, setPlayerInfo] = React.useState<Maybe<PlayerInfo>>(null);

  const updateGameState = (data: ToDGameState) => {
    setCurrentGameState({
      ...data,
      isOwner: data.owner === gameSocket.id,
    });
  }

  React.useEffect(() => {
    gameSocket.on("connect", () => {
      logger.debug("client connected");
    });
  
    gameSocket.on("completeGameState", (data: CompleteGameStateDto) => {
  
      logger.log(`Received full state for ${data.gameCode}`);
      logger.debug(data);
  
      if (currentGameState && data.gameCode !== currentGameState.gameCode) {
        logger.warn(
          `Received a game state for a game we aren't in? ${currentGameState.gameCode} vs received ${data.gameCode}`
        );
      }
  
      updateGameState(data);
    });
  }, [])

  

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

        if (data.success && data.state) {
          setPlayerInfo(player);
          updateGameState(data.state);
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
        setPlayerInfo(player);
        updateGameState(data);

        resolve(data.gameCode);
      });
    });
  };

  const leaveGame = async () => {
    if (!currentGameState || !playerInfo) {
      return;
    }
    
    const socket = await getSocket();
    socket.emit('leaveGame', {} as LeaveGameDto);

    setPlayerInfo(null);
    setCurrentGameState(null);
  }

  const startGame = async () => {
    if (!currentGameState || !playerInfo) {
      return;
    }

    const socket = await getSocket();
    socket.emit('startGame');
  }

  const choosePlayers = async (players: PlayerInfo[]) => {
    const socket = await getSocket();

    const dto: SelectedPlayersDto = {
      players
    }
    socket.emit('selectedPlayers', dto);
  }

  const choseQuestion = async (index: number) => {
    const socket = await getSocket();

    const dto: ChoseQuestionDto = {
      index
    }
    socket.emit('choseQuestion', dto);
  }

  const playerAnsweredQuestion = async (didAnswer: boolean) => {
    const socket = await getSocket();

    const dto: PlayerAnsweredDto = {
      didAnswer
    }
    socket.emit("playerAnswered", dto);
  }

  const choseWinner = async (winner: PlayerInfo) => {
    const socket = await getSocket();

    const dto: PlayerChoseWinnerDto = {
      winner
    }
    socket.emit('playerChoseWinner', dto);
  }

  const startNewRound = async () => {
    const socket = await getSocket();

    const dto: PlayerStartNextRound = {
    }
    socket.emit('playerStartNextRound', dto);
  }

  const likeAnswer = async (player: PlayerInfo) => {
    const socket = await getSocket();

    const dto: PlayerAnswerLikedDto = {
      player
    }
    socket.emit('playerAnswerLiked', dto);
  }

  
  const memoValue = React.useMemo(
    () => ({
      currentGame: currentGameState,
      playerInfo: playerInfo,
      joinGame,
      createGame,
      leaveGame,
      startGame,
      choosePlayers,
      choseQuestion,
      playerAnsweredQuestion,
      choseWinner,
      startNewRound,
      likeAnswer
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
