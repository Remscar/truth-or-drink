import * as React from "react";
import { GameLobby } from "../components/game";
import { CreateGameIfNotInOne } from "../hooks/useGameState";

interface Props {}

// const logger = getLogger("pages::GameRoom");

export const GameRoom: React.FC<Props> = (props: Props) => {

  return (
    <CreateGameIfNotInOne>
      <GameLobby />
      
    </CreateGameIfNotInOne>
  );
};
