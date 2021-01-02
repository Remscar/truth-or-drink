import { Grid, Link, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";

interface Props {}

const useStyles = makeStyles((theme) => ({
  bottom: {
    bottom: 16,
    position: "fixed",
    left: 0,
    width: '100%',
    padding: "8px"
  },
}));

export const Home: React.FC<Props> = (props: Props) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h3" align="center">
            Truth or Drink
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2" align="center">
            The age-old game but now online
          </Typography>
        </Grid>

        <Grid item style={{paddingTop: '32px'}}>
          <StyledButton color="red" href="/new" fullWidth>
            New Game
          </StyledButton>
        </Grid>
        <Grid item>
          <StyledButton color="blue" href="/join" fullWidth>
            Join Game
          </StyledButton>
        </Grid>

        <Grid item style={{paddingTop: '64px'}}>
          <StyledButton color="gray" href="/how" fullWidth>
            How To Play
          </StyledButton>
        </Grid>


      </Grid>
      <Typography variant={"subtitle2"} className={classes.bottom} align={"center"}>
        A website made by Zachary, <Link href={'mailto:contact@truthordrink.party'}>contact me here.</Link>
      </Typography>
    </React.Fragment>
  );
};
