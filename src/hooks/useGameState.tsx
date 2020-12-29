import React from "react";
import { getLogger, Maybe, Socket } from "../util";

import openSocket from "socket.io-client";
import { CreatedDto, CreateDto, PlayerInfo } from "../shared";

const logger = getLogger("hooks:useGameState");

export interface GameStateContext {
  gameId: string;
  awaitingResponse: boolean;
  rawSocket: Socket;
  createGame: (player: PlayerInfo) => Promise<string>;
  joinGame: (player: PlayerInfo, gameId: string) => Promise<boolean>;
}

const gameStateContext = React.createContext<Maybe<GameStateContext>>(null);

export const useGameState = () => {
  const context = React.useContext(gameStateContext);
  if (!context) {
    throw Error("Game State Not ready");
  }
  return context;
};

export const useRawGameState = () => {
  const context = React.useContext(gameStateContext);
  return context;
};

export const GameStateContextProvider: React.FC = (props) => {
  const [rawSocket, setSocket] = React.useState<Socket>(null as unknown as Socket);
  const [gameId, setGameId] = React.useState("");
  const [awaitingResponse, setAwaitingResponse] = React.useState(false);

  React.useEffect(() => {
    if (!rawSocket) {
      logger.log(`Creating socket connection`);
    

      const host = window.location.origin;
      const gameSocket = openSocket(host, { path: "/socket" });
      gameSocket.on("connect", () => {
        console.log("client connected");
      });

      setSocket(gameSocket);
    }
  }, [rawSocket]);

  const getSocket = async () => {
    if (!rawSocket) {
      throw Error(`Socket not ready.`);
    }

    return rawSocket;
  }

  const joinGame = async (player: PlayerInfo, gameId: string) => {
    logger.log(`User ${player.name} has joined game ${gameId}`);
    //setGameId(gameId);

    return true;
  };

  const createGame = async (player: PlayerInfo) => {
    logger.log(`Creating game for ${player.name}`);

    const socket = await getSocket();
    const dto: CreateDto = {
      creator: player
    };
    socket.emit('create', dto);

    setAwaitingResponse(true);

    return new Promise<string>((resolve) => {
      socket.once('created', (data: CreatedDto) => {
        setAwaitingResponse(false);

        logger.log(`Server created our game with code: ${data.gameCode}`);
        setGameId(gameId);

        resolve(gameId);
      });
    });
  }

  let contextValue: Maybe<GameStateContext> = null;

  const memoValue = React.useMemo(
    () => ({
      awaitingResponse,
      gameId,
      rawSocket,
      joinGame,
      createGame
    }),
    [rawSocket, gameId]
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


export const WaitForGameState: React.FC = props => {
  const gameState = useRawGameState();

  if (!gameState) {
    return (<React.Fragment></React.Fragment>)
  } else {
    return (<React.Fragment>{props.children}</React.Fragment>)
  }
}