import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useStartedGameState } from "../../hooks/useGameState";
import { PlayerInfo } from "../../shared";
import { StyledButton } from "../button";

export const GameLobby: React.FC = (props) => {
  const gameState = useStartedGameState();

  if (!gameState.currentGame || gameState.currentGame.started) {
    return null;
  }

  console.log(gameState.currentGame);

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
            {gameState.currentGame.gameCode}
          </Typography>
        </Grid>
        <Grid item container direction="column" xs={12}>
          <Grid item>
            <Typography align="center">Players:</Typography>
          </Grid>
          {gameState.currentGame.players.map((p: PlayerInfo) => (
            <Grid item key={p.name}>
              <Typography align="center">{p.name}</Typography>
            </Grid>
          ))}
        </Grid>
        <Grid item container direction="row" justify="space-around">
          <Grid item>
            <StyledButton color="red">Start Game</StyledButton>
          </Grid>
          <Grid item>
            <StyledButton color="gray" href="/">
              Leave
            </StyledButton>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
