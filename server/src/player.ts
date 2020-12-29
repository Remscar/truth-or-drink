import { Socket } from "socket.io";
import { PlayerInfo } from "../util";


export interface Player extends PlayerInfo {
  socket: Socket;
}

export const createPlayer = (name: string, socket: Socket) => {
  const newPlayer: Player = {
    name,
    socket
  }
  return newPlayer;
}

