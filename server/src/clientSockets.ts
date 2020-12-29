import { Socket } from "socket.io";
import { CreatedDto, CreateDto, getLogger, Maybe } from "../util";
import { GameManager } from "./games";
import { createPlayer, Player } from "./player";

const logger = getLogger("clientSockets");





export const registerNewClientConnection = (socket: Socket) => {
  logger.debug(`Setting up event handlers on new client socket.`);

  let player: Maybe<Player> = null;

  socket.on('create', async (data: CreateDto) => {
    logger.log(`${data.creator.name} request to create a game.`);

    player = createPlayer(data.creator.name, socket);
    const createdGame = await GameManager.createNewGame(player);

    const response: CreatedDto = {
      gameCode: createdGame.code
    }
    socket.emit('created', response);
  });
}


