import { Grid, TextField } from "@material-ui/core";
import React from "react";

export interface GameCodeInput {
  isValid: boolean;
  component: React.ReactFragment;
  code: string;
}

const maxCodeLength = 8;

export const useGameCodeInput = (): GameCodeInput => {
  const [codeError, setCodeError] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [codeHelperText, setCodeHelperText] = React.useState("");

  const onCodeChanged = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    if (newValue.length > maxCodeLength) {
      setCodeError(true);
      setCodeHelperText(`Must be less than ${maxCodeLength} characters long.`);
    } else {
      setCodeError(false);
      setCodeHelperText(``);
    }
    setCode(newValue);
  };

  const gameCodeInputComponent = (
    <React.Fragment>
      <Grid container direction="column" alignItems="stretch" justify="center">
        <Grid item>
          <TextField
            value={code}
            label="Game Code"
            id="gamecode"
            error={codeError}
            onChange={onCodeChanged}
            helperText={codeHelperText}
            fullWidth
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );

  const dataMemo = React.useMemo(() => {
    return {
      isValid: !codeError && code.length > 0,
      component: gameCodeInputComponent,
      code,
    }
  }, [codeError, code]);

  return dataMemo;
};
