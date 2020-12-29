import * as React from "react";
import { useCurrentGameState, useGameState } from "../../hooks/useGameState";
import { getLogger } from "../../util";
import { GameLobby } from "./lobby";

interface Props {}

const logger = getLogger("game::GameRound");

export const GameRound: React.FC<Props> = (props: Props) => {

  const gameState = useGameState();
  const currentGame = useCurrentGameState();


  return (
    <React.Fragment>
      Boo
    </React.Fragment>
  );
};
