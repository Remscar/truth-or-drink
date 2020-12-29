import { Container, Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { StyledButton } from "../components/button";
import {
  PlayerInput,
  useDataPlayerInput,
} from "../components/useDataPlayerInput";
import { useGameState } from "../hooks/useGameState";
import { getLogger, Maybe } from "../util";

interface Props {}

const logger = getLogger("pages::GameRoom");

export const GameRoom: React.FC<Props> = (props: Props) => {
  const gameState = useGameState();

  return (
    <React.Fragment>
      
    </React.Fragment>
  );
};
