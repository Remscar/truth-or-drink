import { CompleteGameStateDto, getLogger } from "../util";
import { gameManager } from "./games";
import { Player } from "./player";
import { socketForRoom } from "./serverSockets";


const logger = getLogger("gameState");

export interface GameState {
  code: string;
  owner: Player;
  players: Player[];
  started: boolean;
  joinGame: (player: Player) => Promise<boolean>
  sendGameState: () => void;
  playerDisconnected: (player: Player) => Promise<void>;
}

export const createGameState = (code: string, owner: Player) => {
  const players: Player[] = [];
  let started = false;

  const joinGame = async (player: Player) => {
    const joinedRooms = Array.from(player.socket.rooms.values());
    for (const room of joinedRooms) {
      player.socket.leave(room);
    }
    player.socket.join(code);

    const existingSocketIndex = players.findIndex(e => e.socket.id === player.socket.id);
    const existingNameIndex = players.findIndex(e => e.name === player.name);

    if (existingSocketIndex >= 0) {
      logger.debug(`Player with socket ${player.socket.id} was already in the game.`);
    } else if (existingNameIndex >= 0) {
      logger.debug(`Player with name ${player.name} was already in name.`);
      const existingPlayer = players[existingNameIndex];
      if (existingPlayer.connected) {
        throw Error(`There is a player with that name!`);
      }
      logger.log(`Player has reconnected probably`);
      existingPlayer.socket = player.socket;
    } else {
      players.push(player);
    }

    return true;
  }

  const getRoomSocket = () => {
    return socketForRoom(code);
  }

  const sendGameState = () => {
    const dto: CompleteGameStateDto = {
      gameCode: code,
      started: started,
      players: players.map(e => ({name: e.name}))
    }
    logger.debug(`Sending game state to all players in ${code}`);

    const socket = getRoomSocket();
    socket.emit('completeGameState', dto);
  }

  const playerDisconnected = async (player: Player) => {
    const connectedPlayers = players.filter(e => e.connected);

    if (connectedPlayers.length == 0) {
      logger.log(`All players have left game ${code}`);
      gameManager.destroyGame(code);
    }
  }

  const newGameState: GameState = {
    code,
    owner,
    players,
    started,
    joinGame,
    sendGameState,
    playerDisconnected
  }

  return newGameState;
}
