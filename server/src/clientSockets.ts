import { Socket } from "socket.io";
import { CreatedDto, CreateDto, getLogger, JoinDto, JoinedDto, Maybe } from "../util";
import { gameManager } from "./games";
import { createPlayer, Player } from "./player";

const logger = getLogger("clientSockets");





export const registerNewClientConnection = (socket: Socket) => {
  logger.debug(`Setting up event handlers on new client socket.`);

  let player: Maybe<Player> = null;

  socket.on('create', async (data: CreateDto) => {
    logger.log(`${data.creator.name} request to create a game.`);

    player = createPlayer(data.creator.name, socket);
    const createdGame = await gameManager.createNewGame(player);

    const response: CreatedDto = {
      gameCode: createdGame.code
    }
    socket.emit('created', response);
  });

  socket.on('join', async (data: JoinDto) => {
    logger.log(`${data.player.name} request to join game ${data.gameCode}`);

    player = createPlayer(data.player.name, socket);

    let response: JoinedDto = {
      success: false
    }
    try {
      await gameManager.joinGame(data.gameCode, player);
      response.success = true;
    } catch (e) {
      logger.log(`${data.player.name} failed to join game ${data.gameCode}: ${e}`);
      response.error = e.message;
    }

    socket.emit('joined', response);
  });


}


