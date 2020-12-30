import { CompleteGameStateDto, getLogger, Maybe, PlayerInfo, Round, RoundState, ToDGameState } from "../util";
import { randomElementFromArray, toPlayerInfo } from "../util/helpers";
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

  public async removePlayerFromGame(player: Player) {
    const shouldDestroy = await super.removePlayerFromGame(player);

    this.sendGameState();

    if (shouldDestroy) {
      return shouldDestroy;
    }

    if (this._dealer?.name === player.name) {
      this._dealer = this.players[0];
      this.newRound();
      this.sendGameState();
    }
    else if (this._currentRound && this._currentRound.players) {
      const foundIndex = this._currentRound.players.findIndex(e => e.name === player.name);
      if (foundIndex > -1) {
        this.newRound();
        this.sendGameState();
      }
    }

    return false;
  }

  public currentGameState(): ToDGameState {
    const ownerPlayer = this.owner;
    const state = {
      gameCode: this.code,
      started: this.started,
      owner: ownerPlayer.socket.id,
      players: this.players.map((e) => ({
        name: e.name,
        owner: e === ownerPlayer,
      })),
      state: this._roundState,
      dealer: toPlayerInfo(this.dealer),
      currentRound: this._currentRound
    }

    return state;
  }

  public sendGameState = () => {
    const currentState = this.currentGameState();
    const dto: CompleteGameStateDto = {
      ...currentState
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
    // if (this._roundState != "waiting") {
    //   throw Error(`Tried to start a round when one is already going`);
    // }

    // choose round type
    const newRound = getRoundData();
    this._roundState = "dealing";
    this._currentRound = newRound;
  }

  public async playersChosen(players: PlayerInfo[]) {
    if (this._roundState != "dealing") {
      throw Error(`Not choosing state`)
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    logger.debug(`Players chosen for ${this.code}`);

    this._currentRound.players = players;
    this._currentRound.turn = 0;
    this._roundState = "choosing";
  }

  public async playerChoseQuestion(index: number) {
    if (this._roundState != "choosing") {
      throw Error(`Not choosing state`)
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    this._roundState = "asking";

    const questionOrder: number[] = this._currentRound.questionsToAsk ?? [];
    questionOrder.push(index);
    
    if (questionOrder.length + 1 === this._currentRound.questions.length) {
      // add the last question, super slow way but it works
      for (let i = 0; i < this._currentRound.questions.length; ++i) {
        if (questionOrder.findIndex(e => e === i) === -1) {
          questionOrder.push(i);
        }
      }
    }

    logger.debug(`Question order for ${this.code} is now ${questionOrder.join(', ')}`);

    this._currentRound.questionsToAsk = questionOrder;
  }

  private chooseNextDealer(): PlayerInfo {
    const nextDealer = randomElementFromArray(this.players);
    return nextDealer;
  }

  public async playerAnsweredQuestion(didAnswer: boolean) {
    if (this._roundState != "asking") {
      throw Error(`Not in the asking state`)
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    didAnswer; // not actually doing anything with this yet

    if (this._currentRound.turn === undefined) {
      throw Error("invalid game state");
    }

    const nextTurn = this._currentRound.turn + 1;

    if (nextTurn >= this._currentRound.questions.length) {
      // out of questions in this round, so onto the next
      this._roundState = "scoring";
      return;
    }

    // Go to the next turn
    this._currentRound.turn = nextTurn;
  }

  public async playerChoseWinner(winner: PlayerInfo) {
    if (this._roundState != "scoring") {
      throw Error(`Not in the asking state`)
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    logger.debug(`${winner.name} won the round.`);

    this._dealer = this.chooseNextDealer();
    this.newRound();
  }

}

export const createGameState = (code: string, originalOwner: Player) => {
  return new GameState(code, originalOwner);
};
