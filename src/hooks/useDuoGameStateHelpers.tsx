import React from "react";
import { Redirect } from "react-router-dom";
import { useRawDuoGameState } from "./useDuoGameState";

export const WaitForDuoGameState: React.FC = props => {
  const gameState = useRawDuoGameState();

  if (!gameState) {
    return (<React.Fragment></React.Fragment>)
  } else {
    return (<React.Fragment>{props.children}</React.Fragment>)
  }
}

export const RequireDuoGameState: React.FC = props => {
  const gameState = useRawDuoGameState();

  if (!gameState || !gameState.currentGame) {
    return (<React.Fragment>
      <Redirect to={"/"} />
    </React.Fragment>)
  }

  return (<React.Fragment>{props.children}</React.Fragment>)
}


export const CreateDuoGameIfNotInOne: React.FC = props => {
  const gameState = useRawDuoGameState();

  React.useEffect(() => {
    if (!gameState) {
      return;
    }

    if (!gameState.currentGame) {
      let randomName = "Zachary" + Math.floor(Math.random() * 100);
      gameState.createGame({name: randomName }, ['rocks']);
    }
  }, [gameState]);

  if (!gameState) {
    return (<React.Fragment></React.Fragment>)
  }

  if (!gameState.currentGame) {
    return (<React.Fragment></React.Fragment>)
  }

  return (<React.Fragment>{props.children}</React.Fragment>)
}
