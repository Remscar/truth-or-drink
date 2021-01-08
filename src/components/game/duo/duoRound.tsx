import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { useCurrentDuoGameState, useDuoGameState } from "../../../hooks/useDuoGameState";
import { useLeaveGame } from "../../../hooks/useLeaveGame";
import { Maybe } from "../../../util";
import { StyledButton } from "../../button";
import { DuoAskerChoosing, DuoAskingQuestion, DuoScorePage, DuoChoosePoints } from "./elements";

interface Props {}

// const logger = getLogger("game::GameRound");

export const DuoGameRound: React.FC<Props> = (props: Props) => {
  const gameState = useDuoGameState();
  const currentGame = useCurrentDuoGameState();
  const leaveGameLogic = useLeaveGame();

  let stateElement: Maybe<React.ReactNode> = null;

  if (currentGame.state === "points") {
    stateElement = <DuoChoosePoints />
  } else if (currentGame.state === "choosing") {
    stateElement = <DuoAskerChoosing />;
  } else if (currentGame.state === "asking") {
    stateElement = <DuoAskingQuestion />;
  } else if (currentGame.state === "scores") {
    stateElement = <DuoScorePage />;
  }

  return (
    <React.Fragment>
      {leaveGameLogic.component}
      <Grid container direction="column" spacing={2} style={{flexGrow: 1}}>
        {/* <Grid item>
          <Typography variant="h3" align="center">
            Truth or Drink
          </Typography>
        </Grid> */}
        <Grid item style={{flexGrow: 1}}>{stateElement}</Grid>
        <Grid item container direction="column" style={{paddingTop: '64px'}}>
          <Grid item>
            <Typography variant="h4" align="center">
              {currentGame.gameCode}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" align="center">
              You are {gameState.playerInfo?.name}
            </Typography>
          </Grid>
          <Grid item>
            <StyledButton
              fullWidth
              color="gray"
              onClick={leaveGameLogic.leaveGame}
            >
              Leave
            </StyledButton>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
