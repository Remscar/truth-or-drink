import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { StyledButton } from "../components/button";
import {
  useDataPlayerInput,
} from "../components/useDataPlayerInput";
import { useGameState } from "../hooks/useGameState";
import { getLogger } from "../util";

interface Props {}

const logger = getLogger("pages::NewGame");

export const NewGame: React.FC<Props> = (props: Props) => {
  const playerDataInput = useDataPlayerInput();

  const [createButtonEnabled, setCreateButtonEnabled] = React.useState(false);
  const [creatingGame, setCreatingGame] = React.useState(false);
  const [sendToGameRoom, setSendToGameRoom] = React.useState(false);

  const gameState = useGameState();

  React.useEffect(() => {
    setCreateButtonEnabled(playerDataInput.isValid);
  }, [playerDataInput]);

  const onCreateGame = async () => {
    logger.log("Creating game");
    setCreatingGame(true);
    await gameState.createGame(playerDataInput.playerInfo);
    setCreatingGame(false);
    setSendToGameRoom(true);
  };

  return (
    <React.Fragment>
      {sendToGameRoom ? <Redirect to={"/game"} /> : null}
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3">New Game</Typography>
        </Grid>
        <Grid item>{playerDataInput.component}</Grid>

        <Grid item>
          <StyledButton
            disabled={!createButtonEnabled || creatingGame}
            color="blue"
            onClick={onCreateGame}
          >
            Create Game
          </StyledButton>
        </Grid>
        <Grid item>
          {creatingGame ? (
            <Typography>Creating Game...</Typography>
          ) : null}
        </Grid>

        <Grid item>
          <StyledButton href="/" color="gray">
            Back
          </StyledButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
