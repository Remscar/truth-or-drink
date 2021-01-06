import * as React from "react";
import { useCurrentDuoGameState } from "../../../hooks/useDuoGameState";
import { DuoGameLobby } from "./duoLobby";
import { DuoGameRound } from "./duoRound";

interface Props {}

// const logger = getLogger("pages::GameRoom");

export const DuoGame: React.FC<Props> = (props: Props) => {

  //const gameState = useGameState();
  const currentGame = useCurrentDuoGameState();

  const showLobby = !currentGame.started;

  return (
    <React.Fragment>
      { showLobby ? <DuoGameLobby /> : <DuoGameRound/> }
    </React.Fragment>
  );
};
