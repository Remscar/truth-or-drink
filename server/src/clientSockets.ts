import { join } from "path";
import { Socket } from "socket.io";
import { CreatedDto, CreateDto, getLogger, IMap, JoinDto, JoinedDto, Maybe } from "../util";
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
      gameCode: createdGame.code
    }
    socket.emit('created', response);

    createdGame.sendGameState();
    game = createdGame;
  });

  socket.on('join', async (data: JoinDto) => {
    logger.log(`${data.player.name} requests to join game ${data.gameCode}`);

    player = createPlayer(data.player.name, socket);

    let response: JoinedDto = {
      success: false
    }
    
    let joinedGame: Maybe<GameState> = null;
    try {
      joinedGame = await gameManager.joinGame(data.gameCode, player);
      logger.log(`${data.player.name} has joined game ${data.gameCode}`);
      response.success = true;
    } catch (e) {
      logger.log(`${data.player.name} failed to join game ${data.gameCode}: ${e}`);
      response.error = e.message;
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

    logger.log(`Socket of player ${socket.id} has disconnected.`);
  })


}


