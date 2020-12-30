"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPlayerInfo = exports.toExistingPlayerInfo = exports.randomElementFromArray = void 0;
exports.randomElementFromArray = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};
function toExistingPlayerInfo(player) {
    const safeInfo = {
        name: player.name
    };
    return safeInfo;
}
exports.toExistingPlayerInfo = toExistingPlayerInfo;
function toPlayerInfo(player) {
    if (!player) {
        return null;
    }
    const safeInfo = {
        name: player.name
    };
    return safeInfo;
}
exports.toPlayerInfo = toPlayerInfo;
