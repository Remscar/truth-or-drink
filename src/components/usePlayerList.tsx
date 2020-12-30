import { Grid, List, ListItem, ListItemText, makeStyles, Typography } from "@material-ui/core";
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
  limitedList?: PlayerInfo[]
}

const useStyles = makeStyles((theme) => ({
  player: {
    
  },
  selectablePlayer: {
    marginTop: '12px',
  },
  notSelectedPlayer: {
    background: 'rgba(0, 0, 0, 0.08)'
  },
  selectedPlayer: {
    background: 'linear-gradient(45deg, rgba(37,180,39,0.2) 30%, rgba(32, 142, 180, 0.4) 90%)'
  },
}));

const logger = getLogger(`usePlayerList`);

export const usePlayerList = (options: PlayerListOptions): PlayerList => {
  const classes = useStyles();
  const currentGame = useCurrentGameState();
  const [selectedPlayers, setSelectedPlayers] = React.useState<PlayerInfo[]>(
    []
  );

  let players = options.limitedList ?? currentGame.players;

  const playerIsSelected = (p: PlayerInfo) => {
    const foundIndex = selectedPlayers.findIndex((e: PlayerInfo) => e.name === p.name);
    return foundIndex > -1;
  }

  const onSelectPlayer = (selectedPlayerName: string) => {
    if (!options.selectable) {
      throw Error(`Cannot select in this context.`);
    }
    const selectedPlayer = {name: selectedPlayerName } as PlayerInfo; // why not

    const newSelectedPlayers: PlayerInfo[] = Object.assign([], selectedPlayers);

    if (playerIsSelected(selectedPlayer)) {
      // deselect the player
      logger.log(`Deselected ${selectedPlayer.name}`);
      const index = newSelectedPlayers.indexOf(selectedPlayer);
      newSelectedPlayers.splice(index, 1);
      setSelectedPlayers(newSelectedPlayers);
      return;
    }

    if (newSelectedPlayers.length >= options.selectable) {
      logger.log(`Deselected ${newSelectedPlayers[0].name} (max)`);
      newSelectedPlayers.splice(0, 1);
    }

    logger.log(`Selected ${selectedPlayer.name}`);
    newSelectedPlayers.push(selectedPlayer);
    setSelectedPlayers(newSelectedPlayers);
  }

  let component: React.ReactNode = null;

  if (options.selectable) {
    component = (
      <React.Fragment>
        {/* <Grid container direction="column">
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
        </Grid> */}
        <List component="nav" aria-label="player list">
        {players.map((p: PlayerInfo) => {
            const isSelected = playerIsSelected(p);
            const playerGridClasses = `${classes.player} ${classes.selectablePlayer} ${isSelected ? classes.selectedPlayer : classes.notSelectedPlayer}`
            return (
            <ListItem key={p.name} className={playerGridClasses} button onClick={() => onSelectPlayer(p.name)} selected={isSelected}>
              <ListItemText primary={p.name} />
            </ListItem>
          )}
          )}
        </List>
      </React.Fragment>
    );
  } else {
    component = (
      <React.Fragment>
        <Grid container direction="column">
          {players.map((p: PlayerInfo) => (
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
