import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useStartedGameState } from "../../hooks/useGameState";

export const GameLobby: React.FC = (props) => {
  const gameState = useStartedGameState();

  if (gameState.state.started) {
    return null;
  }

  console.log(gameState.state);

  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3" align="center">
            Lobby
          </Typography>
          <Typography variant="h4" align="center">
            {gameState.state.gameCode}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
