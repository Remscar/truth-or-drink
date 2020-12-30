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
    paddingTop: "32px",
  },
}));

export const ChooseWinner: React.FC = (props) => {
  const classes = useStyles();
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const localPlayer = gameState.playerInfo;
  const round = currentGame.currentRound;
  const involvedPlayers = currentGame.currentRound?.players;
  const dealer = currentGame.dealer;
  const alreadyLikedList = currentGame.currentRound?.likedAnswers;

  const [hasLikedPlayers, setHasLikedPlayers] = React.useState<number[]>([]);

  if (!currentGame || !localPlayer || !round || !involvedPlayers || !dealer) {
    return <div>Broken choose winner</div>;
  }


  let playersWeHaveLiked: string[] | undefined;
  if (alreadyLikedList) {
    playersWeHaveLiked = alreadyLikedList[localPlayer.name];
  }

  const choseWinner = async (winner: PlayerInfo) => {
    await gameState.choseWinner(winner);
  };

  const likePlayerAnswer = async (player: PlayerInfo, index: number) => {
    const newLikes = Object.assign([], hasLikedPlayers);
    newLikes.push(index);
    setHasLikedPlayers(newLikes);

    await gameState.likeAnswer(player);
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
            {`${dealer.name} is deciding who the winner is...`}
          </Typography>
          <Typography align="center">
            {`But you can award points to answers you liked`}
          </Typography>
          <Grid item container direction="column">
            {involvedPlayers.map((player: PlayerInfo, index: number) => {
              const color = index ? "blue" : "red";
              const hasLiked =
                hasLikedPlayers.findIndex((e) => e === index) > -1 ||
                (playersWeHaveLiked && playersWeHaveLiked.findIndex(e => e === player.name) > -1);
              let buttonText = `👍 ${player.name}'s answer`;
              if (hasLiked) {
                buttonText = `You already liked ${player.name}'s answer`;
              }
              if (player.name === localPlayer.name) {
                return null;
              }
              return (
                <Grid className={classes.choiceButton} item key={index}>
                  <StyledButton
                    color={color}
                    fullWidth
                    disabled={hasLiked}
                    onClick={() => likePlayerAnswer(player, index)}
                  >{buttonText}</StyledButton>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
