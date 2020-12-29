import * as React from "react";
import { useCurrentGameState } from "../../hooks/useGameState";
import { GameLobby } from "./lobby";
import { GameRound } from "./round";

interface Props {}

// const logger = getLogger("pages::GameRoom");

export const Game: React.FC<Props> = (props: Props) => {

  //const gameState = useGameState();
  const currentGame = useCurrentGameState();

  const showLobby = !currentGame.started;

  return (
    <React.Fragment>
      { showLobby ? <GameLobby /> : <GameRound/> }
    </React.Fragment>
  );
};
