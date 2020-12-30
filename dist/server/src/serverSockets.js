"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketForRoom = exports.serverSockets = exports.initServerSockets = void 0;
const socket_io_1 = require("socket.io");
const _1 = require(".");
const util_1 = require("../util");
const logger = util_1.getLogger("serverSockets");
let socketServer;
exports.initServerSockets = (server) => {
    socketServer = new socket_io_1.Server({
        path: "/socket",
    });
    socketServer.listen(server);
    socketServer.on("connection", (socket) => {
        logger.log(`new socket connection`);
        _1.registerNewClientConnection(socket);
    });
};
exports.serverSockets = () => {
    if (!socketServer) {
        throw new Error("No server socket");
    }
    return socketServer;
};
exports.socketForRoom = (room) => {
    const base = exports.serverSockets();
    return base.to(room);
};
