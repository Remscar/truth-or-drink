import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { useCurrentGameState, useGameState } from "../../hooks/useGameState";
import { useLeaveGame } from "../../hooks/useLeaveGame";
import { PlayerInfo } from "../../shared";
import { getLogger, Maybe } from "../../util";
import { StyledButton } from "../button";
import { DealerChoosing } from "./elements";

interface Props {}

const logger = getLogger("game::GameRound");

export const GameRound: React.FC<Props> = (props: Props) => {
  const gameState = useGameState();
  const currentGame = useCurrentGameState();
  const leaveGameLogic = useLeaveGame();

  let stateElement: Maybe<React.ReactNode> = null;

  if (currentGame.state === "choosing") {
    stateElement = <DealerChoosing />;
  }

  return (
    <React.Fragment>
      {leaveGameLogic.component}
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3" align="center">
            Truth or Drink
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h4" align="center">
            {currentGame.gameCode}
          </Typography>
        </Grid>
        <Grid item>{stateElement}</Grid>
        <Grid item container direction="column" xs={12}>
          <Grid item style={{paddingTop: '64px'}}>
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
