
import React from "react";
import { useCurrentGameState, useGameState } from "../../../hooks/useGameState";
import { PlayerInfo } from "../../../shared";
import { Maybe } from "../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../button";

const useStyles = makeStyles((theme) => ({
  question: {
    padding: "8px",
  },
}));

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const AskerChoosing: React.FC = props => {
  const classes = useStyles();
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const involvedPlayers = currentGame.currentRound?.players;
  const turnIndex = currentGame.currentRound?.turn;

  if (
    !currentGame ||
    !localPlayer ||
    !round ||
    !involvedPlayers ||
    turnIndex === undefined
  ) {
    return null;
  }

  

  //const isInvolved = involvedPlayers.findIndex(e => e.name === localPlayer.name);
  const otherPlayer = involvedPlayers.filter((e: PlayerInfo, index: number) => {
    return index !== turnIndex;
  })[0];

  const isPlayerTurn = involvedPlayers[turnIndex].name === localPlayer.name;
  const questions = round.questions;

  let displayComponent: Maybe<React.ReactNode> = null;

  const choseQuestion = (index: number) => {

  }

  if (isPlayerTurn) {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Grid item>
            <Typography align="center">
              Choose one of the following questions to ask {otherPlayer.name}.
            </Typography>
          </Grid>
          <Grid item>
            <Typography align="center">
              They will ask you the other question after they answer.
            </Typography>
          </Grid>
          <Grid item container direction="column">
            {questions.map((question: string, index: number) => {
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
            })}
          </Grid>
          <Grid item>
            <Typography align="center">
              Select which question they should answer:
            </Typography>
          </Grid>
          <Grid item container direction="row" justify="space-around">
            {questions.map((question: string, index: number) => {
              const color = index ? 'blue' : 'red';
              return (
                <StyledButton color={color} onClick={() => choseQuestion(index)}>
                  {`Question ${alphabet[index]}`}
                </StyledButton>
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
            <Typography align="center">
              Choose two players to ask the following questions to.
            </Typography>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
