import * as React from "react";
import { Game } from "../components/game";
import { RequireGameState, useGameState } from "../hooks/useGameState";

interface Props {}

// const logger = getLogger("pages::GameRoom");

export const GameRoom: React.FC<Props> = (props: Props) => {
  const gameState = useGameState();
  //const currentGame = useCurrentGameState();

  const showLobby = !gameState.currentGame?.started;

  return (
    <RequireGameState>
      <Game />
    </RequireGameState>
  );
};
