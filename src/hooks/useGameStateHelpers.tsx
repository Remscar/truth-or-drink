import React from "react";
import { Redirect } from "react-router-dom";
import { useRawGameState } from "./useGameState";

export const WaitForGameState: React.FC = props => {
  const gameState = useRawGameState();

  if (!gameState) {
    return (<React.Fragment></React.Fragment>)
  } else {
    return (<React.Fragment>{props.children}</React.Fragment>)
  }
}

export const RequireGameState: React.FC = props => {
  const gameState = useRawGameState();

  if (!gameState || !gameState.currentGame) {
    return (<React.Fragment>
      <Redirect to={"/"} />
    </React.Fragment>)
  }

  return (<React.Fragment>{props.children}</React.Fragment>)
}


export const CreateGameIfNotInOne: React.FC = props => {
  const gameState = useRawGameState();

  React.useEffect(() => {
    if (!gameState) {
      return;
    }

    if (!gameState.currentGame) {
      gameState.createGame({name: "Zachary Test"});
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