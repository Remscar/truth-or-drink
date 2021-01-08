import React from "react";
import { Maybe } from "../../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../../button";
import { useCurrentDuoGameState, useDuoGameState } from "../../../../hooks/useDuoGameState";

const useStyles = makeStyles((theme) => ({
  question: {
    padding: "8px",
  },
  title: {
    paddingBottom: "32px"
  }
}));

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const DuoAskerChoosing: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useDuoGameState();
  const currentGame = useCurrentDuoGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const turn = round?.turn;
  const questionPoints = round?.questionPoints;

  if (
    !currentGame ||
    !localPlayer ||
    !round ||
    !questionPoints ||
    turn === undefined
  ) {
    return <div>Broken asker choosing</div>;
  }

  //const isInvolved = involvedPlayers.findIndex(e => e.name === localPlayer.name);
  const answeringPlayer = round.playerOrder[turn];
  const askingPlayer = round.playerOrder[(turn + 1) % 2];

  const isPlayerTurn = askingPlayer.name === localPlayer.name;
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
              Choose one of the following questions to ask {answeringPlayer.name}.
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
                  <Typography style={{fontWeight: 'bold'}}>{`Question ${alphabet[index]} for ${questionPoints[index]} points`}</Typography>
                  <Typography>{question}</Typography>
                </Grid>
              );
            })}
          </Grid>
          <Grid item style={{ paddingTop: "48px" }}>
            <Typography align="center">
              Select which question they should answer:
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
                <Grid item 
                key={index}
                style={{ paddingTop: "24px" }}>
                  <StyledButton
                  key={index}
                  color={color}
                  onClick={() => choseQuestion(index)}
                  fullWidth
                >
                  {`Question ${alphabet[index]} for ${questionPoints[index]} points`}
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
            <Typography variant="h3" align="center" style={{paddingBottom: '12px'}}>
              Waiting...
            </Typography>
            <Typography align="center">
              {`${askingPlayer.name} is choosing which question they want to ask you.`}
            </Typography>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
