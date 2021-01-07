import * as http from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { getLogger } from "../util";
import { registerNewPartyClientConnection } from "./party";

const logger = getLogger("serverSockets");

let socketServer: SocketServer | undefined;

const normalSocketPath = "/socket";
const duoSocketPath = "/duosocket";

export const initServerSockets = (server: http.Server) => {
  socketServer = new SocketServer({
    path: "/socket",
  });
  socketServer.listen(server);
  socketServer.on("connection", (socket: Socket) => {
    logger.log(`new socket connection`);
    registerNewPartyClientConnection(socket);
  });
};


export const serverSockets = (): SocketServer => {
  if (!socketServer) {
    throw new Error("No server socket");
  }
  return socketServer;
};

export const socketForRoom = (room: string): SocketServer => {
  const base = serverSockets();
  return base.to(room);
}
