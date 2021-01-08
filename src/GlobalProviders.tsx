import React from "react";
import { DuoGameStateContextProvider } from "./hooks/useDuoGameState";
import { GameSocketContextProvider } from "./hooks/useGameSocket";
import { GameStateContextProvider } from "./hooks/useGameState";

export const GlobalProviders: React.FC = (props) => {
  return (
    <GameSocketContextProvider>
      <DuoGameStateContextProvider>
        <GameStateContextProvider>{props.children}</GameStateContextProvider>
      </DuoGameStateContextProvider>
    </GameSocketContextProvider>
  );
};
