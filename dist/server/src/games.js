"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = void 0;
const util_1 = require("../util");
const gameState_1 = require("./gameState");
const logger = util_1.getLogger("games");
const games = new Map();
const generateGameCode = () => {
    const desiredCodeLength = 4;
    const digitOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    while (code.length < desiredCodeLength) {
        const randomDigit = digitOptions[Math.floor(Math.random() * digitOptions.length)];
        code = code + randomDigit;
    }
    return code;
};
const getGame = (gameCode) => {
    return games.get(gameCode);
};
const createNewGame = async (creator) => {
    const gameCode = generateGameCode();
    logger.log(`Creating game for ${creator.name} with code ${gameCode}`);
    let newGameState = null;
    if (!games.has(gameCode)) {
        newGameState = gameState_1.createGameState(gameCode, creator);
        games.set(gameCode, newGameState);
    }
    else {
        const game = games.get(gameCode);
        if (!game) {
            throw Error("impossible");
        }
        newGameState = game;
    }
    await joinGame(gameCode, creator);
    return newGameState;
};
const joinGame = async (gameCode, player) => {
    const gameState = getGame(gameCode);
    if (!gameState) {
        const errorMsg = `No game ${gameCode} found.`;
        throw Error(errorMsg);
    }
    logger.log(`${player.name} joining game ${gameCode}`);
    await gameState.joinGame(player);
    return gameState;
};
const destroyGame = async (gameCode) => {
    logger.log(`Destroying game ${gameCode}`);
    games.delete(gameCode);
};
exports.gameManager = {
    createNewGame,
    joinGame,
    destroyGame
};
