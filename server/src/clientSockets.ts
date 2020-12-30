import { join } from "path";
import { Socket } from "socket.io";
import { ChoseQuestionDto, CreatedDto, CreateDto, getLogger, IMap, JoinDto, JoinedDto, Maybe, SelectedPlayersDto } from "../util";
import { gameManager } from "./games";
import { GameState } from "./gameState";
import { createPlayer, Player } from "./player";

const logger = getLogger("clientSockets");




export const registerNewClientConnection = (socket: Socket) => {
  logger.debug(`Setting up event handlers on new client socket.`);

  let player: Maybe<Player> = null;
  let game: Maybe<GameState> = null;

  socket.on('create', async (data: CreateDto) => {
    logger.log(`${data.creator.name} requests to create a game.`);

    player = createPlayer(data.creator.name, socket);
    const createdGame = await gameManager.createNewGame(player);

    const response: CreatedDto = {
      ...createdGame.currentGameState()
    }
    socket.emit('created', response);

    createdGame.sendGameState();
    game = createdGame;
  });

  socket.on('join', async (data: JoinDto) => {
    logger.log(`${data.player.name} requests to join game ${data.gameCode}`);

    player = createPlayer(data.player.name, socket);
    let success = false;
    let error = "";
    
    let joinedGame: Maybe<GameState> = null;
    try {
      joinedGame = await gameManager.joinGame(data.gameCode, player);
      logger.log(`${data.player.name} has joined game ${data.gameCode}`);
      success = true;
    } catch (e) {
      logger.log(`${data.player.name} failed to join game ${data.gameCode}: ${e}`);
      error = e.message;
    }

    let response: JoinedDto = {
      success,
      error,
      state: joinedGame ? joinedGame.currentGameState() : null
    }

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
    } catch (e) {
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

  socket.on('selectedPlayers', async (data: SelectedPlayersDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} selected ${data.players.length} players`);

    // no security for now, should add later
    await game.playersChosen(data.players);

    game.sendGameState();
  });

  socket.on('choseQuestion', async (data: ChoseQuestionDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} chose question ${data.index}`);

    // no security for now, will add later (maybe?), hack me

    await game.playerChoseQuestion(data.index);

    game.sendGameState();
  })


}


