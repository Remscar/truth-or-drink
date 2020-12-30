import { CompleteGameStateDto, getLogger, PlayerInfo } from "../util";
import { getCard } from "./deck";
import { gameManager } from "./games";
import { Player } from "./player";
import { socketForRoom } from "./serverSockets";

const logger = getLogger("BaseGameState");

export class BaseGameState {
  public readonly players: Player[];

  protected _started: boolean = false;
  protected _owner: PlayerInfo;

  constructor(public code: string, owner: Player) {
    this.players = [];
    this._owner = owner;
  }

  public get started(): boolean {
    return this._started;
  }

  public get owner(): Player {
    const foundOwner = this.players.find((e) => e.name === this._owner.name);
    if (!foundOwner) {
      throw Error(`No Owner Found for game ${this.code}`);
    }

    return foundOwner;
  }

  public joinGame = async (player: Player) => {
    const joinedRooms = Array.from(player.socket.rooms.values());
    for (const room of joinedRooms) {
      player.socket.leave(room);
    }
    player.socket.join(this.code);

    const existingSocketIndex = this.players.findIndex(
      (e) => e.socket.id === player.socket.id
    );
    const existingNameIndex = this.players.findIndex((e) => e.name === player.name);

    if (existingSocketIndex >= 0) {
      logger.debug(
        `Player with socket ${player.socket.id} was already in the game.`
      );
      const existingPlayer = this.players[existingSocketIndex];
      existingPlayer.name = player.name;
    } else if (existingNameIndex >= 0) {
      logger.debug(`Player with name ${player.name} was already in name.`);
      const existingPlayer = this.players[existingNameIndex];
      if (existingPlayer.connected) {
        throw Error(`There is a player with that name!`);
      }
      logger.log(`Player has reconnected probably`);
      existingPlayer.socket = player.socket;
    } else {
      this.players.push(player);
    }

    return true;
  }

  public sendGameState = () => {
    // const ownerPlayer = this.owner;
    // const dto: CompleteGameStateDto = {
    //   gameCode: this.code,
    //   started: this.started,
    //   owner: ownerPlayer.socket.id,
    //   players: this.players.map((e) => ({ name: e.name, owner: e === ownerPlayer })),
    // };
    // logger.debug(`Sending game state to all players in ${this.code}`);

    // const socket = this.getRoomSocket();
    // socket.emit("completeGameState", dto);
  };

  public playerDisconnected = async (player: Player) => {
    const connectedPlayers = this.players.filter((e) => e.connected);

    if (connectedPlayers.length == 0) {
      logger.log(`All players have left game ${this.code}`);
      gameManager.destroyGame(this.code);
    }
  };

  public removePlayerFromGame = async (player: Player) => {
    const index = this.players.findIndex((e) => e.name === player.name);
    if (index < 0) {
      logger.log(
        `Tried to remove player ${player.name} from ${this.code} but they aren't there`
      );
      return;
    }

    this.players.splice(index, 1);
  };

  public startGame = async () => {
    logger.log(`Game ${this.code} is starting...`);
    this._started = true;
  };

  protected getRoomSocket = () => {
    return socketForRoom(this.code);
  };
}

// export const createBaseGameState = (code: string, originalOwner: Player) => {
//   return new BaseGameState(code, originalOwner);
// };
