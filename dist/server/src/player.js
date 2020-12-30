"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayer = void 0;
const players = {};
exports.createPlayer = (name, socket) => {
    if (players[socket.id]) {
        return players[socket.id];
    }
    const newPlayer = {
        name,
        socket,
        connected: true,
    };
    return newPlayer;
};
