import { Container, Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";

interface Props {}

export const Home: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3" align="center">Truth or Drink</Typography>
        </Grid>
        <Grid item>
          <StyledButton color="red" href="/new" fullWidth>New Game</StyledButton>
        </Grid>
        <Grid item>
          <StyledButton color="blue" href="/join" fullWidth>Join Game</StyledButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
