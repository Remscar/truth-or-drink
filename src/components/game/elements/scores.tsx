import React from "react";
import { useCurrentGameState, useGameState } from "../../../hooks/useGameState";
import { PlayerInfo } from "../../../shared";
import { Maybe } from "../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../button";

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: "32px",
  },
  scoresHeader: {
    paddingTop: "32px",
  },
  scoreLine: {},
  startButton: {
    paddingTop: "32px",
  },
}));

export const ScorePage: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const localPlayer = gameState.playerInfo;
  const dealer = currentGame.dealer;

  if (!currentGame || !localPlayer || !dealer) {
    return null;
  }

  const startRound = async () => {
    await gameState.startNewRound();
  };

  let displayComponent: Maybe<React.ReactNode> = null;

  if (dealer.name === localPlayer.name) {
    displayComponent = (
      <React.Fragment>
        <div className={classes.startButton}>
          <StyledButton fullWidth color="red" onClick={() => startRound()}>
            Start Next Round
          </StyledButton>
        </div>
      </React.Fragment>
    );
  }

  interface PlayerScore {
    player: string;
    score: number;
  }
  const sortedPlayerScores = Object.entries(currentGame.scores)
    .map(
      ([player, score]) =>
        ({
          player,
          score: score as number,
        } as PlayerScore)
    )
    .sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);

  return (
    <React.Fragment>
      <Grid container direction="column" alignItems="center">
        <Typography variant="h3" align="center" className={classes.title}>
          Scores
        </Typography>
        <Typography align="center">
          {`${dealer.name} will be the next dealer.`}
        </Typography>
        <Typography align="center" className={classes.scoresHeader}>
          {`Scores:`}
        </Typography>
        <Grid item container direction="column" alignItems="center">
          {sortedPlayerScores.map((data: PlayerScore, index: number) => {
            return (
              <Grid key={data.player} item>
                <Typography className={classes.scoreLine}>
                  {`${index === 0 ? `👑` : ``} ${data.player}: ${data.score}`}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
        <Grid item>{displayComponent}</Grid>
      </Grid>
    </React.Fragment>
  );
};
