import React from "react";
import { Maybe } from "../../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../../button";
import { useCurrentDuoGameState, useDuoGameState } from "../../../../hooks/useDuoGameState";

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

export const DuoScorePage: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useDuoGameState();
  const currentGame = useCurrentDuoGameState();
  const localPlayer = gameState.playerInfo;
  const dealer = currentGame.dealer;

  if (!currentGame || !localPlayer || !dealer) {
    return <div>Broken scores :(</div>;
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
  const sortedPlayerScores = Object.entries(currentGame.playerStates)
    .map(
      ([player, state]) =>
        ({
          player,
          score: state.score as number,
        } as PlayerScore)
    )
    .sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);

  const sortedPlayerLikes = Object.entries(currentGame.playerStates)
    .map(
      ([player, state]) =>
        ({
          player,
          score: state.likes as number,
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

            const topLiked = sortedPlayerLikes[0].player === data.player && sortedPlayerLikes[0].score > 0;

            const numLikes = currentGame.playerStates[data.player].likes;

            return (
              <Grid key={data.player} item>
                <Typography className={classes.scoreLine} style={{whiteSpace: "break-spaces"}}>
                  {`${index === 0 ? `👑` : ``}${data.player.padEnd(24)} ${data.score} points`}
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
