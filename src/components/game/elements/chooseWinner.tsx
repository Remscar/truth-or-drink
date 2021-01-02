import React from "react";
import { useCurrentGameState, useGameState } from "../../../hooks/useGameState";
import { PlayerInfo } from "../../../shared";
import { Maybe } from "../../../util";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { StyledButton } from "../../button";

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
  const [timeLeft, setTimeLeft] = React.useState<number>(15);
  const [hasVotedForWinner, setHasVotedForWinner] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(Math.ceil((currentGame.timerEnd - now) / 1000), 0);
      setTimeLeft(timeLeft);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!currentGame || !localPlayer || !round || !involvedPlayers || !dealer) {
    return <div>Broken choose winner</div>;
  }

  let playersWeHaveLiked: string[] | undefined;
  if (alreadyLikedList) {
    playersWeHaveLiked = alreadyLikedList[localPlayer.name];
  }

  const choseWinner = async (winner: PlayerInfo) => {
    setHasVotedForWinner(true);
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
    if (currentGame.someoneSkipped) {
      displayComponent = (
        <React.Fragment>
          <Grid container direction="column">
            <Typography variant="h3" align="center" className={classes.title}>
              Winner
            </Typography>
            <Typography align="center">
              {`You can award points to answers you liked`}
            </Typography>
            <Grid item container direction="column">
              {involvedPlayers.map((player: PlayerInfo, index: number) => {
                const color = index ? "blue" : "red";
                const hasLiked =
                  hasLikedPlayers.findIndex((e) => e === index) > -1 ||
                  (playersWeHaveLiked &&
                    playersWeHaveLiked.findIndex((e) => e === player.name) >
                      -1);
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
                    >
                      {buttonText}
                    </StyledButton>
                  </Grid>
                );
              })}
            </Grid>
            <Typography style={{ paddingTop: "32px" }} align="center">
              {`Next Round in`}
            </Typography>
            <Typography
              style={{ paddingTop: "64px" }}
              variant={"h1"}
              align="center"
            >
              {`${timeLeft}`}
            </Typography>
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
            <React.Fragment>
                <Typography align="center">
                  Who gave the most authentic, truthful and potentially revealing answer?
                </Typography>

                <Grid item container direction="column">
                  {involvedPlayers.map((player: PlayerInfo, index: number) => {
                    const color = index ? "blue" : "red";
                    return (
                      <Grid className={classes.choiceButton} item key={index}>
                        <StyledButton
                          color={color}
                          fullWidth
                          disabled={hasVotedForWinner}
                          onClick={() => choseWinner(player)}
                        >{`${player.name}'s Answer`}</StyledButton>
                      </Grid>
                    );
                  })}
                </Grid>
              </React.Fragment>
            {!hasVotedForWinner ? null: (
              <React.Fragment>
                <Typography align="center" style={{paddingTop: '32px'}}>
                  {`You can also award points to answers you liked`}
                </Typography>
                <Grid item container direction="column">
                  {involvedPlayers.map((player: PlayerInfo, index: number) => {
                    const color = index ? "blue" : "red";
                    const hasLiked =
                      hasLikedPlayers.findIndex((e) => e === index) > -1 ||
                      (playersWeHaveLiked &&
                        playersWeHaveLiked.findIndex((e) => e === player.name) >
                          -1);
                    let buttonText = `👍 Like ${player.name}'s answer`;
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
                        >
                          {buttonText}
                        </StyledButton>
                      </Grid>
                    );
                  })}
                </Grid>
              </React.Fragment>
            )}

            <Typography style={{ paddingTop: "32px" }} align="center">
              {`Next Round in`}
            </Typography>
            <Typography
              style={{ paddingTop: "64px" }}
              variant={"h1"}
              align="center"
            >
              {`${timeLeft}`}
            </Typography>
          </Grid>
        </React.Fragment>
      );
    }
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
                (playersWeHaveLiked &&
                  playersWeHaveLiked.findIndex((e) => e === player.name) > -1);
              let buttonText = `👍 Like ${player.name}'s answer`;
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
                  >
                    {buttonText}
                  </StyledButton>
                </Grid>
              );
            })}
          </Grid>
          <Typography style={{ paddingTop: "32px" }} align="center">
            {`Next Round in`}
          </Typography>
          <Typography
            style={{ paddingTop: "64px" }}
            variant={"h1"}
            align="center"
          >
            {`${timeLeft}`}
          </Typography>
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{displayComponent}</React.Fragment>;
};
