import { CompleteGameStateDto, getLogger } from "../util";
import { gameManager } from "./games";
import { Player } from "./player";
import { socketForRoom } from "./serverSockets";


const logger = getLogger("gameState");

export interface GameState {
  code: string;
  getOwner: () => Player;
  players: Player[];
  started: boolean;
  joinGame: (player: Player) => Promise<boolean>
  sendGameState: () => void;
  playerDisconnected: (player: Player) => Promise<void>;
  removePlayerFromGame: (player: Player) => Promise<void>;
  startGame: () => Promise<void>;
}

export const createGameState = (code: string, originalOwner: Player) => {
  const players: Player[] = [];
  let started = false;
  let ownerName = originalOwner.name;

  const getOwner = () => {
    const owner = players.find(e => e.name == ownerName);
    if (!owner) {
      throw Error(`No Owner Found for game ${code}`);
    }

    return owner;
  }

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
      const existingPlayer = players[existingSocketIndex];
      existingPlayer.name = player.name;
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
    const ownerPlayer = getOwner();
    const dto: CompleteGameStateDto = {
      gameCode: code,
      started: started,
      owner: ownerPlayer.socket.id,
      players: players.map(e => ({name: e.name, owner: e === ownerPlayer}))
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

  const removePlayerFromGame = async (player: Player) => {
    const index = players.findIndex(e => e.name === player.name);
    if (index < 0) {
      logger.log(`Tried to remove player ${player.name} from ${code} but they aren't there`);
      return;
    }

    players.splice(index, 1);
  }

  const startGame = async () => {
    logger.log(`Game ${code} is starting...`);
    started = true;
  }

  const newGameState: GameState = {
    code,
    getOwner,
    players,
    started,
    joinGame,
    sendGameState,
    playerDisconnected,
    removePlayerFromGame,
    startGame
  }

  return newGameState;
}
