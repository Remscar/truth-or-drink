"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNewClientConnection = void 0;
const util_1 = require("../util");
const games_1 = require("./games");
const player_1 = require("./player");
const logger = util_1.getLogger("clientSockets");
exports.registerNewClientConnection = (socket) => {
    logger.debug(`Setting up event handlers on new client socket. ${socket.id}`);
    let player = null;
    let game = null;
    socket.on('create', async (data) => {
        logger.log(`${data.creator.name} requests to create a game.`);
        player = player_1.createPlayer(data.creator.name, socket);
        const createdGame = await games_1.gameManager.createNewGame(player);
        const response = {
            ...createdGame.currentGameState()
        };
        socket.emit('created', response);
        createdGame.sendGameState();
        game = createdGame;
    });
    socket.on('join', async (data) => {
        logger.log(`${data.player.name} requests to join game ${data.gameCode}`);
        player = player_1.createPlayer(data.player.name, socket);
        let success = false;
        let error = "";
        let joinedGame = null;
        try {
            joinedGame = await games_1.gameManager.joinGame(data.gameCode, player);
            logger.log(`${data.player.name} has joined game ${data.gameCode}`);
            success = true;
        }
        catch (e) {
            logger.log(`${data.player.name} failed to join game ${data.gameCode}: ${e}`);
            error = e.message;
        }
        let response = {
            success,
            error,
            state: joinedGame ? joinedGame.currentGameState() : null
        };
        socket.emit('joined', response);
        if (joinedGame) {
            joinedGame.sendGameState();
            game = joinedGame;
        }
    });
    socket.on('disconnect', async () => {
        if (!player || !game) {
            return;
        }
        player.connected = false;
        await game.playerDisconnected(player);
        logger.log(`Socket of player ${player.name} ${socket.id} has disconnected.`);
    });
    socket.on('leaveGame', async () => {
        if (!player || !game) {
            return;
        }
        try {
            logger.log(`Player ${player.name} is leaving game ${game.code}`);
            const wasDestroyed = await game.removePlayerFromGame(player);
            if (!wasDestroyed) {
                game.sendGameState();
            }
            game = null;
            player = null;
        }
        catch (e) {
            logger.error(`Error: ${e}`);
        }
    });
    socket.on('startGame', async () => {
        if (!player || !game) {
            return;
        }
        if (game.owner.socket.id !== player.socket.id) {
            logger.warn(`${player.name} just is starting the game that they aren't the owner of.`);
            return;
        }
        await game.startGame();
        await game.newRound();
        game.sendGameState();
    });
    socket.on('selectedPlayers', async (data) => {
        if (!player || !game) {
            return;
        }
        logger.log(`${player.name} selected ${data.players.length} players`);
        // no security for now, should add later
        await game.playersChosen(data.players);
        game.sendGameState();
    });
    socket.on('choseQuestion', async (data) => {
        if (!player || !game) {
            return;
        }
        logger.log(`${player.name} chose question ${data.index}`);
        // no security for now, will add later (maybe?), hack me
        await game.playerChoseQuestion(data.index);
        game.sendGameState();
    });
    socket.on('playerAnswered', async (data) => {
        if (!player || !game) {
            return;
        }
        logger.log(`${player.name} says that the asked person ${data.didAnswer ? "did" : "did not"} answer the question.`);
        // no security here either, i'm on a timeline here
        await game.playerAnsweredQuestion(data.didAnswer);
        game.sendGameState();
    });
    socket.on('playerChoseWinner', async (data) => {
        if (!player || !game) {
            return;
        }
        logger.log(`${player.name} chose ${data.winner.name} as the winner`);
        await game.playerChoseWinner(data.winner);
        game.sendGameState();
    });
    socket.on('playerStartNextRound', async () => {
        if (!player || !game) {
            return;
        }
        logger.log(`${player.name} is starting the next round`);
        await game.startNextRound();
        game.sendGameState();
    });
    socket.on('playerAnswerLiked', async (data) => {
        if (!player || !game) {
            return;
        }
        logger.log(`${player.name} liked ${data.player}'s answer`);
        await game.playerLikedAnswer(player, data.player);
    });
};
