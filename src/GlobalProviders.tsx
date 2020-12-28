import React from "react";
import { GameStateContextProvider } from "./hooks/useGameState"


export const GlobalProviders: React.FC = props => {
  return (
    <GameStateContextProvider>
      {props.children}
    </GameStateContextProvider>
  )
}