import React from "react";
import { getLogger } from "../util";

const logger = getLogger('hooks:useGameState');

export interface GameStateContext {
  gameId: string;
  joinedGame: (gameId: string) => void
}

const gameStateContext = React.createContext<GameStateContext>({
  gameId: "",
  joinedGame: (gameId: string) => {}
});

export const useGameState = () => {
  const context = React.useContext(gameStateContext);
  return context;
}

export const GameStateContextProvider: React.FC = props => {
  const [gameId, setGameId] = React.useState("");

  const onJoinedGame = (gameId: string) => {
    logger.log(`User has joined game ${gameId}`);
    setGameId(gameId);
  }

  const contextValue = React.useMemo(() => ({
    gameId,
    joinedGame: onJoinedGame
  }), [
    gameId
  ])

  return <gameStateContext.Provider value={contextValue}>{props.children}</gameStateContext.Provider>
}
