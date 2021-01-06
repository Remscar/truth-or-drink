import {
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import { DeckTypes } from "../shared";
import { Redirect } from "react-router-dom";
import { StyledButton } from "../components/button";
import { useDataPlayerInput } from "../components/useDataPlayerInput";
import { useGameState } from "../hooks/useGameState";

import { getLogger } from "../util";
import { useDuoGameState } from "../hooks/useDuoGameState";

interface Props {}

const logger = getLogger("pages::NewGame");

const deckNames = {
  Spicy: "Dirty Cards",
  Rocks: "Chill cards",
  Happy: "Feel good cards",
  PG13: "PG-13",
  RatedR: "Rated R",
  PG: "PG",
  Friends: "HobbyLark for Friends",
  OverText: "HobbyLark Over Text",
  WildCards: "25 Wild Cards",
  WildCards2: "25 More Wild Cards"
}

export const NewGame: React.FC<Props> = (props: Props) => {
  const playerDataInput = useDataPlayerInput();

  const [createButtonEnabled, setCreateButtonEnabled] = React.useState(false);
  const [creatingGame, setCreatingGame] = React.useState(false);
  const [sendToGameRoom, setSendToGameRoom] = React.useState(false);
  const [selectedDecks, setSelectedDecks] = React.useState<string[]>([DeckTypes.Rocks]);

  const gameState = useGameState();
  const duoGameState = useDuoGameState();

  React.useEffect(() => {
    setCreateButtonEnabled(playerDataInput.isValid);
  }, [playerDataInput]);

  const onCreateGame = async () => {
    logger.log("Creating game");
    setCreatingGame(true);
    await gameState.createGame(playerDataInput.playerInfo, selectedDecks);
    setCreatingGame(false);
    setSendToGameRoom(true);
  };

  const onCreateDuoGame = async () => {
    logger.log("Creating Duos game");
    setCreatingGame(true);
    await duoGameState.createGame(playerDataInput.playerInfo, selectedDecks);
    setCreatingGame(false);
    setSendToGameRoom(true);
  };

  const isDeckSelected = (deck: string) => {
    return selectedDecks.findIndex((e) => e === deck) > -1;
  };

  const getDeckName = (deck: string) => {
    const name = deckNames[deck];
    if (name) {
      return name;
    }

    return deck;
  }

  const onToggleDeck = async (deck: string) => {
    const index = selectedDecks.findIndex((e) => e === deck);
    const newDecks = Object.assign([], selectedDecks) as string[];
    if (index > -1) {
      newDecks.splice(index, 1);
    } else {
      newDecks.push(deck);
    }

    logger.log(newDecks);

    setSelectedDecks(newDecks);
  };

  return (
    <React.Fragment>
      {sendToGameRoom ? <Redirect to={"/game"} /> : null}
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3">New Game</Typography>
        </Grid>
        <Grid item>{playerDataInput.component}</Grid>

        <Grid item container direction="column">
          <Grid item>
            <Typography variant="h6">Decks</Typography>
          </Grid>
          {Object.entries(DeckTypes).map(([key, value]) => {
            const isSelected = isDeckSelected(value);
            return (
              <Grid item key={key} container direction="row">
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        name={`Deck${key}`}
                        onChange={() => onToggleDeck(value)}
                      />
                    }
                    label={`${getDeckName(key)}`}
                  />
                </Grid>
              </Grid>
            );
          })}
        </Grid>

        <Grid item>
          <StyledButton
            disabled={!createButtonEnabled || creatingGame || selectedDecks.length === 0}
            color="blue"
            fullWidth
            onClick={onCreateGame}
          >
            Create Party Game (3+ Players)
          </StyledButton>
        </Grid>
        <Grid item>
          {creatingGame ? <Typography>Creating Game...</Typography> : null}
        </Grid>

        <Grid item>
          <StyledButton
            disabled={!createButtonEnabled || creatingGame || selectedDecks.length === 0}
            color="blue"
            fullWidth
            onClick={onCreateDuoGame}
          >
            Create Duo Game (2 Players)
          </StyledButton>
        </Grid>
        <Grid item>
          {creatingGame ? <Typography>Creating Game...</Typography> : null}
        </Grid>


        <Grid item>
          <StyledButton fullWidth href="/" color="gray">
            Back
          </StyledButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
