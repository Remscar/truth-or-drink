import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { useCurrentGameState, useGameState } from "../../hooks/useGameState";
import { useLeaveGame } from "../../hooks/useLeaveGame";
import { PlayerInfo } from "../../shared";
import { getLogger } from "../../util";
import { StyledButton } from "../button";

const logger = getLogger("game::lobby");

export const GameLobby: React.FC = (props) => {
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const leaveGameLogic = useLeaveGame();

  const onStartGame = () => {
    logger.debug(`Trying to start game.`);
    gameState.startGame();
  };

  const canStartGame = currentGame.players.length < 3;

  return (
    <React.Fragment>
      {leaveGameLogic.component}
      <Grid container direction="column" spacing={2} style={{flexGrow: 1}}>
        <Grid item>
          <Typography variant="h3" align="center">
            Lobby
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h4" align="center">
            {currentGame.gameCode}
          </Typography>
        </Grid>
        <Grid item container direction="column" style={{flexGrow: 1}}>
          <Grid item>
            <Typography align="center" variant="subtitle2">
              Players:
            </Typography>
          </Grid>
          {currentGame.players.map((p: PlayerInfo) => (
            <Grid item key={p.name} container direction="row" justify="center">
              {p.owner ? (
                <Grid item>
                  <Typography
                    align="center"
                    style={{ paddingRight: "24px" }}
                  >{`👑`}</Typography>
                </Grid>
              ) : null}
              <Grid item>
                <Typography align="center">{`${p.name}`}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Grid item container direction="row" justify="space-around">
          {currentGame.isOwner ? (
            <Grid item>
              <StyledButton disabled={canStartGame} color="red" onClick={onStartGame}>
                Start Game
              </StyledButton>
            </Grid>
          ) : null}
          <Grid item>
            {!currentGame.isOwner ? (
              <Typography align="center" variant="subtitle1">
                Waiting for host to start....
              </Typography>
            ) : null}
            <StyledButton
              fullWidth
              color="gray"
              onClick={leaveGameLogic.leaveGame}
            >
              Leave
            </StyledButton>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
