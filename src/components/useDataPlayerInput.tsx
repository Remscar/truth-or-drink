import { Grid, TextField } from "@material-ui/core";
import React from "react";
import { PlayerInfo } from "../shared";

export interface PlayerInput {
  isValid: boolean;
  component: React.ReactFragment;
  name: string;
  playerInfo: PlayerInfo;
}

const maxNameLength = 32;

export const useDataPlayerInput = (): PlayerInput => {
  const [nameError, setNameError] = React.useState(false);
  const [name, setName] = React.useState("");
  const [nameHelperText, setNameHelperText] = React.useState("");

  const onNameChanged = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    if (newValue.length > maxNameLength) {
      setNameError(true);
      setNameHelperText(`Must be less than ${maxNameLength} letters long.`);
    } else {
      setNameError(false);
      setNameHelperText(``);
    }
    setName(newValue);
  };

  const playerInputComponent = (
    <React.Fragment>
      <Grid container direction="column" alignItems="stretch" justify="center">
        <Grid item>
          <TextField
            value={name}
            label="Your Name"
            id="playername"
            error={nameError}
            onChange={onNameChanged}
            helperText={nameHelperText}
            fullWidth
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );

  const dataMemo = React.useMemo(() => {
    return {
      isValid: !nameError && name.length > 0,
      component: playerInputComponent,
      name,
      playerInfo: {
        name
      } as PlayerInfo
    }
  }, [nameError, name, playerInputComponent]);

  return dataMemo;
};
