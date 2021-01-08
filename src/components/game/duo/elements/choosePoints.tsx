import React from "react";
import { Maybe } from "../../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../../button";
import {
  useCurrentDuoGameState,
  useDuoGameState,
} from "../../../../hooks/useDuoGameState";

const useStyles = makeStyles((theme) => ({
  question: {
    padding: "8px",
  },
  title: {
    paddingBottom: "32px",
  },
}));

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const DuoChoosePoints: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useDuoGameState();
  const currentGame = useCurrentDuoGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const questionPointValues = currentGame.questionPointValues;

  const actingPlayer = currentGame.dealer;

  if (!currentGame || !localPlayer || !round || !actingPlayer) {
    return <div>Broken asker choosing</div>;
  }

  //const isInvolved = involvedPlayers.findIndex(e => e.name === localPlayer.name);
  
  //const otherPlayer = round.playerOrder[(turn + 1) % 2];

  const isPlayerTurn = actingPlayer.name === localPlayer.name;
  const questions = round.questions;

  let displayComponent: Maybe<React.ReactNode> = null;

  const choseQuestion = async (index: number) => {
    await gameState.choseQuestion(index);
  };

  if (isPlayerTurn) {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Grid item>
            <Typography variant="h3" align="center" className={classes.title}>
              Choose
            </Typography>
            <Typography>
              Choose between these two questions which should be worth more
              points to answer.
            </Typography>
          </Grid>
          <Grid item>
            <Typography>
              The other player will have the option between choosing which
              question they want to answer.
            </Typography>
            <Typography style={{paddingTop: '12px'}}>
              {`The chosen question will be worth ${questionPointValues[0]} points.`}
            </Typography>
            <Typography>
              {`The other question will be worth ${questionPointValues[1]}.`}
            </Typography>
          </Grid>
          <Grid item container direction="column" style={{paddingTop: '32px'}}>
            {questions.map((question: string, index: number) => {
              const className = "question" + index;
              const realClassName = classes[className];
              return (
                <Grid
                  item
                  key={index}
                  className={`${classes.question} ${
                    realClassName ? realClassName : ""
                  }`}
                >
                  <Typography
                    style={{ fontWeight: "bold" }}
                  >{`Question ${alphabet[index]}`}</Typography>
                  <Typography>{question}</Typography>
                </Grid>
              );
            })}
          </Grid>
          <Grid item style={{ paddingTop: "48px" }}>
            <Typography align="center">
              Select which question should be worth more points:
            </Typography>
          </Grid>
          <Grid
            item
            container
            direction="column"
            style={{ paddingTop: "24px" }}
          >
            {questions.map((question: string, index: number) => {
              const color = index ? "blue" : "red";
              return (
                <Grid key={index} item style={{ paddingTop: "24px" }}>
                  <StyledButton
                    key={index}
                    color={color}
                    onClick={() => choseQuestion(index)}
                    fullWidth
                  >
                    {`Question ${alphabet[index]} is worth ${questionPointValues[0]} points.`}
                  </StyledButton>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  } else {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Grid item>
            <Typography
              variant="h3"
              align="center"
              style={{ paddingBottom: "12px" }}
            >
              Waiting...
            </Typography>
            <Typography align="center">
              {`${actingPlayer.name} is choosing point values for questions.`}
            </Typography>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
