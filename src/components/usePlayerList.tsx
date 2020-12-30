import { Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { useCurrentGameState } from "../hooks/useGameState";
import { PlayerInfo } from "../shared";
import { getLogger } from "../util";

interface PlayerList {
  component: React.ReactNode;
  selectedPlayers: PlayerInfo[];
}

interface PlayerListOptions {
  showOwner?: boolean;
  selectable?: number;
}

const useStyles = makeStyles((theme) => ({
  player: {
    
  },
  selectablePlayer: {
    marginTop: '12px',
    height: '46px',
  },
  notSelectedPlayer: {

  },
  selectedPlayer: {

  },
}));

const logger = getLogger(`usePlayerList`);

export const usePlayerList = (options: PlayerListOptions): PlayerList => {
  const classes = useStyles();
  const currentGame = useCurrentGameState();
  const [selectedPlayers, setSelectedPlayers] = React.useState<PlayerInfo[]>(
    []
  );

  const playerIsSelected = (p: PlayerInfo) => {
    const foundIndex = selectedPlayers.findIndex((e: PlayerInfo) => e.name === p.name);
    return foundIndex > -1;
  }

  const onSelectPlayer = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!options.selectable) {
      throw Error(`Cannot select in this context.`);
    }

    const selectedPlayerName = event.currentTarget.id;
    const selectedPlayer = {name: selectedPlayerName } as PlayerInfo; // why not

    if (playerIsSelected(selectedPlayer)) {
      // deselect the player
      logger.log(`Deselected ${selectedPlayer.name}`);
      const index = selectedPlayers.indexOf(selectedPlayer);
      selectedPlayers.splice(index, 1);
      setSelectedPlayers(selectedPlayers);
      return;
    }

    if (selectedPlayers.length >= options.selectable) {
      logger.log(`Deselected ${selectedPlayers[0].name} (max)`);
      selectedPlayers.splice(0, 1);
    }

    logger.log(`Selected ${selectedPlayer.name}`);
    selectedPlayers.push(selectedPlayer);
    setSelectedPlayers(selectedPlayers);
  }

  let component: React.ReactNode = null;

  if (options.selectable) {
    component = (
      <React.Fragment>
        <Grid container direction="column">
          {currentGame.players.map((p: PlayerInfo) => {
            const isSelected = playerIsSelected(p);
            const playerGridClasses = `${classes.player} ${classes.selectablePlayer} ${isSelected ? classes.selectedPlayer : classes.notSelectedPlayer}`
            return (
            <Grid item id={p.name} key={p.name} onClick={onSelectPlayer} className={playerGridClasses} container direction="row" justify="center">
              <Grid item>
                <Typography align="center">{`${p.name}`}</Typography>
              </Grid>
            </Grid>
          )}
          )}
        </Grid>
      </React.Fragment>
    );
  } else {
    component = (
      <React.Fragment>
        <Grid container direction="column">
          {currentGame.players.map((p: PlayerInfo) => (
            <Grid item key={p.name} container direction="row" justify="center">
              {options.showOwner && p.owner ? (
                <Grid item>
                  <Typography
                    align="center"
                    style={{ paddingRight: "24px" }}
                  >{`👑`}</Typography>
                </Grid>
              ) : null}
              <Grid item>
                <Typography align="center">{`${p.name}`}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </React.Fragment>
    );
  }

  return {
    component,
    selectedPlayers,
  };
};
