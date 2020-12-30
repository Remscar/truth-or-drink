import React from "react";
import { useCurrentGameState, useGameState } from "../../../hooks/useGameState";
import { PlayerInfo } from "../../../shared";
import { Maybe } from "../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../button";

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
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const involvedPlayers = currentGame.currentRound?.players;
  const turnIndex = currentGame.currentRound?.turn;
  const questionIndicesToAsk = currentGame.currentRound?.questionsToAsk;

  const [hasLikedAnswer, setHasLikedAnswer] = React.useState(false);

  React.useEffect(() => {
    setHasLikedAnswer(false);
  }, [turnIndex])

  if (
    !currentGame ||
    !localPlayer ||
    !round ||
    !involvedPlayers ||
    !questionIndicesToAsk ||
    turnIndex === undefined
  ) {
    return <div>Broken ask questions</div>;
  }

  const actingPlayer = involvedPlayers[turnIndex];
  const otherPlayer = involvedPlayers.filter((e: PlayerInfo, index: number) => {
    return index !== turnIndex;
  })[0];
  const isOtherPlayer = localPlayer.name === otherPlayer.name;

  const isPlayerTurn = involvedPlayers[turnIndex].name === localPlayer.name;
  const questionIndexToAsk = questionIndicesToAsk[turnIndex];
  const askedQuestion = round.questions[questionIndexToAsk];

  const playerAnswered = async (didTheyAnswer: boolean) => {
    await gameState.playerAnsweredQuestion(didTheyAnswer);
  };

  const onLikeAnswer = async () => {
    setHasLikedAnswer(true);
    await gameState.likeAnswer(otherPlayer);
  }

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
            <Typography align="center">{askedQuestion}</Typography>
          </Grid>

          <Grid item style={{ paddingTop: "24px" }}>
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
          <Typography align="center">
            {`You can either answer it, or skip (drink.)`}
          </Typography>
          <Grid
            item
            container
            direction="column"
            justify="center"
            style={{ paddingTop: "24px" }}
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
  } else {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item>
            <Typography variant="h3" align="center" className={classes.title}>
              Truth?
            </Typography>
            <Typography align="center">
              {`${actingPlayer.name} is asking ${otherPlayer.name} a question`}
            </Typography>
          </Grid>
          <Grid item style={{paddingTop: "32px"}}>
            <StyledButton disabled={hasLikedAnswer} onClick={onLikeAnswer} color="blue">
            👍 Answer
            </StyledButton>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
