import * as React from "react";
import { DuoGame } from "../components/game/duo/duoMain";
import { RequireDuoGameState } from "../hooks/useDuoGameStateHelpers";

interface Props {}

// const logger = getLogger("pages::GameRoom");

export const DuoGameRoom: React.FC<Props> = (props: Props) => {
  //const gameState = useGameState();
  //const currentGame = useCurrentGameState();

  return (
    <RequireDuoGameState>
      <DuoGame />
    </RequireDuoGameState>
  );
};
