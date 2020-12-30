import { CompleteGameStateDto, getLogger, Maybe, PlayerInfo, Round, RoundState } from "../util";
import { BaseGameState } from "./baseGameState";
import { Player } from "./player";
import { getRoundData } from "./todGame";

const logger = getLogger("gameState");

export class GameState extends BaseGameState {
  private _dealer: Maybe<PlayerInfo> = null;
  private _roundState: RoundState = "waiting";

  private _currentRound: Maybe<Round> = null;

  public constructor(public code: string, owner: Player) {
    super(code, owner);
  }

  public get dealer(): Maybe<Player> {
    const foundDealer = this.players.find((e) => e.name === this._dealer?.name);
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
      state: this._roundState,
      dealer: this.dealer ? {name: this.dealer.name} : null,
      currentRound: this._currentRound
    };
    logger.debug(`Sending game state to all players in ${this.code}`);

    const socket = this.getRoomSocket();
    socket.emit("completeGameState", dto);
  };

  public async startGame() {
    super.startGame();
    this._dealer = this.owner;
  };

  public async newRound() {
    if (this._roundState != "waiting") {
      throw Error(`Tried to start a round when one is already going`);
    }

    // choose round type
    const newRound = getRoundData();
    this._roundState = "start";
    this._currentRound = newRound;
  }

}

export const createGameState = (code: string, originalOwner: Player) => {
  return new GameState(code, originalOwner);
};
