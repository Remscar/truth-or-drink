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
  title: {
    paddingBottom: "32px"
  }
}));

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const AskerChoosing: React.FC = (props) => {
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
    return <div>Broken asker choosing</div>;
  }

  //const isInvolved = involvedPlayers.findIndex(e => e.name === localPlayer.name);
  const actingPlayer = involvedPlayers[turnIndex];
  const otherPlayer = involvedPlayers.filter((e: PlayerInfo, index: number) => {
    return index !== turnIndex;
  })[0];

  const isPlayerTurn = involvedPlayers[turnIndex].name === localPlayer.name;
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
                  key={index}
                  className={`${classes.question} ${
                    realClassName ? realClassName : ""
                  }`}
                >
                  <Typography style={{fontWeight: 'bold'}}>{`Question ${alphabet[index]}`}</Typography>
                  <Typography>{question}</Typography>
                </Grid>
              );
            })}
          </Grid>
          <Grid item style={{ paddingTop: "24px" }}>
            <Typography align="center">
              Select which question they should answer:
            </Typography>
          </Grid>
          <Grid
            item
            container
            direction="row"
            justify="space-around"
            style={{ paddingTop: "24px" }}
          >
            {questions.map((question: string, index: number) => {
              const color = index ? "blue" : "red";
              return (
                <StyledButton
                  key={index}
                  color={color}
                  onClick={() => choseQuestion(index)}
                >
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
            <Typography variant="h3" align="center" style={{paddingBottom: '12px'}}>
              Waiting...
            </Typography>
            <Typography align="center">
              {`${actingPlayer.name} is choosing which question they want to ask ${otherPlayer.name}.`}
            </Typography>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
