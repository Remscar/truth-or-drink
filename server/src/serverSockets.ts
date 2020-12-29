import * as http from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { registerNewClientConnection } from ".";
import { getLogger } from "../util";

const logger = getLogger("serverSockets");

let socketServer: SocketServer | undefined;

export const initServerSockets = (server: http.Server) => {
  socketServer = new SocketServer({
    path: "/socket",
  });
  socketServer.listen(server);
  socketServer.on("connection", (socket: Socket) => {
    logger.log(`new socket connection`);
    registerNewClientConnection(socket);
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
