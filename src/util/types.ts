import { Socket } from "socket.io-client";


import { Socket as SocketIOSocket } from "socket.io-client";

export type Maybe<T> = T | null;
export type Socket = typeof SocketIOSocket;
export type CouldError<T> = {
  error?: string;
  value: T
}
