import React from "react";
import { Redirect } from "react-router-dom";
import { useGameState } from "./useGameState";

export const useLeaveGame = () => {
  const gameState = useGameState();
  const [hasLeft, setHasLeft] = React.useState(false);

  const leaveGame = async () => {
    setHasLeft(true);
    gameState.leaveGame();
  }

  const component = hasLeft ? (<Redirect to="/" />) : null;

  return {
    component,
    leaveGame
  }
}
