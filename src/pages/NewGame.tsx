import { Container, Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";
import { PlayerInput, useDataPlayerInput } from "../components/useDataPlayerInput";
import { useGameState } from "../hooks/useGameState";
import { getLogger, Maybe } from "../util";

interface Props {}

const logger = getLogger("pages::NewGame");

export const NewGame: React.FC<Props> = (props: Props) => {

  const playerDataInput = useDataPlayerInput();

  const [createButtonEnabled, setCreateButtonEnabled] = React.useState(false);
  const [creatingGame, setCreatingGame] = React.useState(false);

  const gameState = useGameState();

  React.useEffect(() => {
    setCreateButtonEnabled(playerDataInput.isValid);
  }, [playerDataInput.name]);

  const onCreateGame = async () => {
    logger.log("Creating game");
    setCreatingGame(true);

    const res =  await fetch("/create", {
      method: 'POST'
    });

    if (res.status !== 200) {
      logger.error('Failed to make game.');
      logger.debug(res);
      setCreatingGame(false);
      return;
    }

    const newGameId = (await res.json()).id;

    logger.log(`Created a new game with id ${newGameId}`);
    gameState.joinedGame(newGameId);

    
  }

  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3">New Game</Typography>
        </Grid>
        <Grid item>
          {playerDataInput.component}
        </Grid>

        <Grid item>
          <StyledButton disabled={!createButtonEnabled || creatingGame} color="blue" onClick={onCreateGame}>Create Game</StyledButton>
        </Grid>
        <Grid item>
          <StyledButton href="/" color="gray">Back</StyledButton>
        </Grid>

        

      </Grid>
    </React.Fragment>
  );
};
