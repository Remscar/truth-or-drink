import React from "react";
import { PlayerInfo } from "../../../../shared";
import { Maybe } from "../../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../../button";
import { useCurrentDuoGameState, useDuoGameState } from "../../../../hooks/useDuoGameState";

const useStyles = makeStyles((theme) => ({
  question: {
    paddingTop: "32px",
  },
  title: {
    paddingBottom: "32px"
  }
}));

export const AskingQuestion: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useDuoGameState();
  const currentGame = useCurrentDuoGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const turn = round?.turn;
  const questionIndicesToAsk = currentGame.currentRound?.questionsToAsk;

  if (
    !currentGame ||
    !localPlayer ||
    !round ||
    !questionIndicesToAsk ||
    turn === undefined
  ) {
    return <div>Broken ask questions</div>;
  }

  const actingPlayer = round.playerOrder[turn % 2];
  const otherPlayer = round.playerOrder[(turn + 1) % 2];

  const isOtherPlayer = localPlayer.name === otherPlayer.name;

  const isPlayerTurn = actingPlayer.name === localPlayer.name;

  const questionIndexToAsk = questionIndicesToAsk[turn];
  const askedQuestion = round.questions[questionIndexToAsk];

  const playerAnswered = async (didTheyAnswer: boolean) => {
    await gameState.playerAnsweredQuestion(didTheyAnswer, otherPlayer);
  };

  let displayComponent: Maybe<React.ReactNode> = null;

  if (isPlayerTurn) {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Grid item>
            <Typography variant='h3' align="center" className={classes.title}>
              Ask
            </Typography>
          </Grid>
          <Grid item>
            <Typography align="center">
              Ask {otherPlayer.name} this question:
            </Typography>
          </Grid>
          <Grid item className={classes.question}>
            <Typography align="center" style={{fontWeight: 'bold'}}>{askedQuestion}</Typography>
          </Grid>

          <Grid item style={{ paddingTop: "72px" }}>
            <Typography align="center">Did they answer it?</Typography>
          </Grid>
          <Grid
            item
            container
            direction="row"
            justify="space-around"
            style={{ paddingTop: "24px" }}
          >
            <StyledButton color={"red"} onClick={() => playerAnswered(true)}>
              {`Yes`}
            </StyledButton>
            <StyledButton color={"blue"} onClick={() => playerAnswered(false)}>
              {`No`}
            </StyledButton>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  } else if (isOtherPlayer) {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Typography variant="h3" align="center" className={classes.title}>
            Answer?
          </Typography>
          <Typography align="center">
            {`${actingPlayer.name} will ask you a question.`}
          </Typography>
          <Typography align="center" style={{paddingTop: '12px'}}>
            You can either answer it, or skip (drink.)
          </Typography>

          <Typography variant="subtitle1" align="center" style={{paddingTop: '24px'}}>
            Try to give your most authentic, truthful and potentially revealing answer.
          </Typography>

          <Grid
            item
            container
            direction="column"
            justify="center"
            style={{ paddingTop: "72px" }}
          >
            <Grid item>
            <StyledButton fullWidth color={"red"} onClick={() => playerAnswered(true)}>
              {`I answered`}
            </StyledButton>
            </Grid>
            <Grid item style={{paddingTop: "24px"}}>
            <StyledButton fullWidth color={"blue"} onClick={() => playerAnswered(false)}>
              {`I skipped (or drank)`}
            </StyledButton>
            </Grid>
            
            
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
