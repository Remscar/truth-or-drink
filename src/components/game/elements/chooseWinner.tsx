import React from "react";
import { useCurrentGameState, useGameState } from "../../../hooks/useGameState";
import { PlayerInfo } from "../../../shared";
import { Maybe } from "../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../button";
import { NumberLiteralType } from "typescript";
import { EOF } from "dns";

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: "32px",
  },
  choiceButton: {
    paddingTop: "32px"
  }
}));

export const ChooseWinner: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const involvedPlayers = currentGame.currentRound?.players;
  const dealer = currentGame.dealer;

  if (!currentGame || !localPlayer || !round || !involvedPlayers || !dealer) {
    return null;
  }

  const choseWinner = async (winner: PlayerInfo) => {
    await gameState.choseWinner(winner);
  };

  let displayComponent: Maybe<React.ReactNode> = null;

  if (dealer.name === localPlayer.name) {
    displayComponent = (
      <React.Fragment>
        <Grid container direction="column">
          <Typography variant="h3" align="center" className={classes.title}>
            Winner
          </Typography>
          <Typography align="center">
            {`Who do you think had the best answer?`}
          </Typography>
          <Grid item container direction="column">
            {involvedPlayers.map((player: PlayerInfo, index: number) => {
              const color = index ? "blue" : "red";
              return (
                <Grid className={classes.choiceButton} item key={index}>
                  <StyledButton
                    color={color}
                    fullWidth
                    onClick={() => choseWinner(player)}
                  >{`${player.name} had the best answer`}</StyledButton>
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
          <Typography variant="h3" align="center" className={classes.title}>
            Winner
          </Typography>
          <Typography align="center">
            {`${dealer.name} is deciding who had the best answer.`}
          </Typography>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
