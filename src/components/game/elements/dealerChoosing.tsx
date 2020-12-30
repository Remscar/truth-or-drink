import { Grid, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useCurrentGameState, useGameState } from "../../../hooks/useGameState";
import { Maybe, playerEquals } from "../../../util";
import { StyledButton } from "../../button";
import { usePlayerList } from "../../usePlayerList";

const useStyles = makeStyles((theme) => ({
  question: {
    padding: "8px",
  },
  question0: {},
  question1: {},
  playersListStart: {
    paddingTop: "12px"
  }
}));

export const DealerChoosing: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const currentDealer = currentGame.dealer;
  const localPlayer = gameState.playerInfo;

  const canSelect =
    localPlayer && currentDealer && playerEquals(localPlayer, currentDealer);
  const numToSelect = 2;

  const playerList = usePlayerList({
    selectable: canSelect ? numToSelect : 0,
  });

  if (!currentDealer || !localPlayer || !currentGame.currentRound) {
    return null;
  }

  const canContinue = playerList.selectedPlayers.length > 1;

  const onContinue = async () => {
    await gameState.choosePlayers(playerList.selectedPlayers);
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let displayComponent: Maybe<React.ReactNode> = null;

  if (playerEquals(currentDealer, localPlayer)) {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Grid item>
            <Typography align="center">
              Choose two players to ask the following questions to.
            </Typography>
          </Grid>
          <Grid item container direction="column">
            {currentGame.currentRound.questions.map(
              (question: string, index: number) => {
                const className = "question" + index;
                const realClassName = classes[className];
                return (
                  <Grid
                    item
                    className={`${classes.question} ${
                      realClassName ? realClassName : ""
                    }`}
                  >
                    <Typography>{`Question ${alphabet[index]}`}</Typography>
                    <Typography>{question}</Typography>
                  </Grid>
                );
              }
            )}
          </Grid>
          <Grid item className={classes.playersListStart}>
            <Typography align="center" variant="subtitle2">
              Players:
            </Typography>
          </Grid>
          <Grid item>{playerList.component}</Grid>
          <Grid item>
            <StyledButton fullWidth color="red" onClick={onContinue} disabled={!canContinue} >Continue</StyledButton>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  } else {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Grid item>
            <Typography align="center">
              Waiting {currentDealer.name} to choose who to ask questions to...
            </Typography>
          </Grid>
          <Grid item className={classes.playersListStart}>
            <Typography align="center" variant="subtitle2">
              Players:
            </Typography>
          </Grid>
          <Grid item>{playerList.component}</Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
