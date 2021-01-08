import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { StyledButton } from "../components/button";
import { useDataPlayerInput } from "../components/useDataPlayerInput";
import { useGameCodeInput } from "../components/useGameCodeInput";
import { useDuoGameState } from "../hooks/useDuoGameState";
import { useGameState } from "../hooks/useGameState";
import { GameType } from "../shared";
import { getLogger } from "../util";

interface Props {}

const logger = getLogger("pages::JoinGame");

export const JoinGame: React.FC<Props> = (props: Props) => {
  const playerDataInput = useDataPlayerInput();
  const gameCodeInput = useGameCodeInput();
  const gameState = useGameState();
  const duoGameState = useDuoGameState();

  const [joinButtonEnabled, setJoinButtonEnabled] = React.useState(false);
  const [joiningGame, setJoiningGame] = React.useState(false);
  const [joinError, setJoinError] = React.useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = React.useState("");

  const [sendToPartyGameRoom, setSendToPartyGameRoom] = React.useState(false);
  const [sendToDuoGameRoom, setSendToDuoGameRoom] = React.useState(false);

  React.useEffect(() => {
    setJoinButtonEnabled(
      playerDataInput.isValid && gameCodeInput.code.length > 0
    );
  }, [playerDataInput]);

  const onJoinGame = async () => {
    logger.log(
      `Player ${playerDataInput.name} wants to join game ${gameCodeInput.code}`
    );

    setJoiningGame(true);
    let mode: GameType = 'party';

    let res = await gameState.joinGame(
      playerDataInput.playerInfo,
      gameCodeInput.code
    );

    if (res.error) {
      res = await duoGameState.joinGame(
        playerDataInput.playerInfo,
        gameCodeInput.code
      );
      mode = 'duo';
    }

    setJoiningGame(false);

    logger.log(res);

    if (res.error) {
      setJoinError(true);
      setJoinErrorMessage(res.error);
      return;
    }

    if (mode === 'party') {
      setSendToPartyGameRoom(true);
    } else {
      setSendToDuoGameRoom(true);
    }
  };

  return (
    <React.Fragment>
      {sendToPartyGameRoom ? <Redirect to={"/game"} /> : null}
      {sendToDuoGameRoom ? <Redirect to={"/duos"} /> : null}
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
            fullWidth
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
          <StyledButton fullWidth href="/" color="gray">
            Back
          </StyledButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
