import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";

interface Props {}

export const HowToPlay: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Grid container direction="column" spacing={2} style={{flexGrow: 1}}>
        <Grid item>
          <Typography align="center" variant="h3">How To Play</Typography>
        </Grid>

        <Grid container item direction="column" style={{flexGrow: 1}}>
          <Typography variant="body2" align="center">Truth or Drink is easy to learn</Typography>
          
          <Typography variant="h5" style={{paddingTop: '16px'}}>1. Dealer Chooses Players</Typography>
          <Typography variant="body1"> The dealer will choose two players to answer two different questions.</Typography>

          <Typography variant="h5" style={{paddingTop: '16px'}}>2. Decide Which Question</Typography>
          <Typography variant="body1">One of the two chosen players decides which of the two questions to ask to the other chosen player.</Typography>

          <Typography variant="h5" style={{paddingTop: '16px'}}>3. Questions are asked</Typography>
          <Typography variant="body1">The players will ask each other the questions, they will either answer or pass (and take a drink.)</Typography>

          <Typography variant="h5" style={{paddingTop: '16px'}}>4. Dealer Chooses Winner</Typography>
          <Typography variant="body1">The dealer will choose the winner of the round; the person who <b>gave the most the most authentic, truthful and potentially revealing answer</b>.</Typography>

          <Typography variant="h5" style={{paddingTop: '24px'}}>Winning</Typography>
          <Typography variant="body1">Winning grants quite a few points while not answering a question will make you lose points. Scores are displayed at the end of each round.</Typography>
          <Typography variant="body2">Answers can also be "liked" which will grant additional points.</Typography>
        </Grid>



        <Grid item style={{paddingTop: '72px', paddingBottom: '32px'}}>
          <StyledButton fullWidth href="/" color="gray">
            Back
          </StyledButton>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
