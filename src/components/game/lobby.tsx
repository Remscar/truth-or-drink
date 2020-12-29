import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useStartedGameState } from "../../hooks/useGameState";
import { StyledButton } from "../button";

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
        </Grid>
        <Grid item>
          <Typography variant="h4" align="center">
            {gameState.state.gameCode}
          </Typography>
        </Grid>
        <Grid item container direction="column" xs={12}>
          <Grid item>
            <Typography align="center">Names</Typography>
          </Grid>
        </Grid>
        <Grid item container direction="row" justify="space-around">
          <Grid item>
            <StyledButton color="red">Start Game</StyledButton>
          </Grid>
          <Grid item>
            <StyledButton color="gray">Leave</StyledButton>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
