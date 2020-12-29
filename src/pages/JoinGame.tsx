import { Container, Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";
import { useDataPlayerInput } from "../components/useDataPlayerInput";
import { useGameCodeInput } from "../components/useGameCodeInput";
import { useGameState } from "../hooks/useGameState";
import { getLogger } from "../util";

interface Props {}

const logger = getLogger("pages::JoinGame");

export const JoinGame: React.FC<Props> = (props: Props) => {
  const playerDataInput = useDataPlayerInput();
  const gameCodeInput = useGameCodeInput();
  const gameState = useGameState();

  const [joinButtonEnabled, setJoinButtonEnabled] = React.useState(false);
  const [joiningGame, setJoiningGame] = React.useState(false);
  const [joinError, setJoinError] = React.useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = React.useState("");

  React.useEffect(() => {
    setJoinButtonEnabled(playerDataInput.isValid);
  }, [playerDataInput.name]);

  const onJoinGame = async () => {
    logger.log(
      `Player ${playerDataInput.name} wants to join game ${gameCodeInput.code}`
    );

    setJoiningGame(true);
    const res = await gameState.joinGame(
      playerDataInput.playerInfo,
      gameCodeInput.code
    );
    setJoiningGame(false);

    logger.log(res);

    if (res.error) {
      setJoinError(true);
      setJoinErrorMessage(res.error);
    }
  };

  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3">Join Game</Typography>
        </Grid>
        <Grid item>{playerDataInput.component}</Grid>
        <Grid item>{gameCodeInput.component}</Grid>

        <Grid item>
          <StyledButton
            disabled={!joinButtonEnabled || joiningGame}
            color="blue"
            onClick={onJoinGame}
          >
            Join Game
          </StyledButton>
        </Grid>
        {joiningGame ? (
          <Grid item>
            <Typography>Joining Game...</Typography>
          </Grid>
        ) : null}
        {joinError ? (
          <Grid item>
            <Typography>{`Error Joining Game: ${joinErrorMessage}`}</Typography>
          </Grid>
        ) : null}


        <Grid item>
          <StyledButton href="/" color="gray">
            Back
          </StyledButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
