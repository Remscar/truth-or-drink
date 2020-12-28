import { Container, Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";

interface Props {}

export const JoinGame: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h3">Join Game</Typography>
        </Grid>
        {/* <Grid item>
          <StyledButton color="red" href="/new">New Game</StyledButton>
        </Grid>
        <Grid item>
          <StyledButton color="blue" href="/join">Join Game</StyledButton>
        </Grid> */}
      </Grid>
    </React.Fragment>
  );
};
