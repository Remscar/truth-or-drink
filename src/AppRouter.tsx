import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Home } from "./pages";
import { Container, makeStyles } from "@material-ui/core";
import { NewGame } from "./pages/NewGame";
import { JoinGame } from "./pages/JoinGame";
import { GameRoom } from "./pages/GameRoom";
import { HowToPlay } from "./pages/HowToPlay";
import { DuoGameRoom } from "./pages/DuoGameRoom";

const useStyles = makeStyles((theme) => ({
  root: {
    // fontWeight: 500,
    // fontStretch: "normal",
    // fontStyle: "normal",
    // lineHeight: "normal",
    // letterSpacing: "0.5px",
    // textAlign: "left",
    paddingTop: "50px",
    display: "flex",
    minHeight: "calc(100vh - 50px)",
    flexDirection: "column"
  },
}));

export const AppRouter: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div style={{height: '100vh'}}>
      <Container maxWidth="md" className={classes.root}>
        <BrowserRouter>
          <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route exact={true} path="/new" component={NewGame} />
            <Route exact={true} path="/join" component={JoinGame} />
            <Route exact={true} path="/game" component={GameRoom} />
            <Route exact={true} path="/duos" component={DuoGameRoom} />
            <Route exact={true} path="/how" component={HowToPlay} />
          </Switch>
        </BrowserRouter>
      </Container>
    </div>
  );
};
