import { Socket } from "socket.io";
import { IMap, PlayerInfo } from "../util";


export interface Player extends PlayerInfo {
  socket: Socket;
  connected: boolean;
}

const players: IMap<Player> = {};


export const createPlayer = (name: string, socket: Socket) => {
  if (players[socket.id]) {
    return players[socket.id];
  }

  const newPlayer: Player = {
    name,
    socket,
    connected: true,
  }
  return newPlayer;
}

