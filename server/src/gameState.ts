import { CompleteGameStateDto, getLogger, Maybe, PlayerInfo } from "../util";
import { BaseGameState } from "./baseGameState";
import { Player } from "./player";

const logger = getLogger("gameState");

export class GameState extends BaseGameState {
  private _dealer: Maybe<PlayerInfo> = null;

  constructor(public code: string, owner: Player) {
    super(code, owner);
  }

  public get dealer(): Maybe<Player> {
    const foundDealer = this.players.find((e) => e.name === this._dealer.name);
    if (!foundDealer) {
      return null;
    }

    return foundDealer;
  }

  public sendGameState = () => {
    const ownerPlayer = this.owner;
    const dto: CompleteGameStateDto = {
      gameCode: this.code,
      started: this.started,
      owner: ownerPlayer.socket.id,
      players: this.players.map((e) => ({
        name: e.name,
        owner: e === ownerPlayer,
      })),
    };
    logger.debug(`Sending game state to all players in ${this.code}`);

    const socket = this.getRoomSocket();
    socket.emit("completeGameState", dto);
  };
}

export const createGameState = (code: string, originalOwner: Player) => {
  return new GameState(code, originalOwner);
};
