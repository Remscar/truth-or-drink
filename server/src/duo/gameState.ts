import {
  CompleteDuoGameStateDto,
  CompleteGameStateDto,
  DeckTypes,
  DuoRound,
  DuoRoundState,
  DuoToDGameState,
  getLogger,
  IMap,
  Maybe,
  PlayerGameState,
  PlayerInfo,
  Round,
  RoundState,
  ToDGameState,
} from "../../util";
import {
  randomElementFromArray,
  shuffleArray,
  toExistingPlayerInfo,
  toPlayerInfo,
} from "../../util/helpers";
import { BaseGameState } from "../baseGameState";
import { Player } from "../player";
import { TruthOrDrinkGame } from "../todGame";

const logger = getLogger("duo::gameState");



const pointsForSkipping = 0;

interface ExtendedPlayerGameState extends PlayerGameState {
  player: Player;
}

export class DuoGameState extends BaseGameState {
  private _dealer: Maybe<PlayerInfo> = null;
  private _roundState: DuoRoundState = "waiting";
  private _questionPointValues: [number, number] = [2, 1];

  private _currentRound: Maybe<DuoRound> = null;

  private _playerData: IMap<ExtendedPlayerGameState> = {};

  private _lastDealer: Maybe<PlayerInfo> = null;

  private _game: TruthOrDrinkGame;

  public constructor(public code: string, owner: Player, destroyCallback: Function, decks?: string[]) {
    super('duo', code, owner, destroyCallback);

    this._game = new TruthOrDrinkGame(
      decks ?? [DeckTypes.Rocks, DeckTypes.Spicy, DeckTypes.Happy]
    );
  }

  private getPlayerState(player: PlayerInfo): ExtendedPlayerGameState {
    let playerState = this._playerData[player.name];
    if (playerState) {
      return playerState;
    }

    const playerInstance = this.getPlayers(false).find((e) => e.name === player.name);

    if (!playerInstance) {
      throw Error(`Player ${player.name} not in game ${this.code}`);
    }

    playerState = {
      score: 0,
      likes: 0,
      timesChosen: 0,
      player: playerInstance,
    };

    this._playerData[player.name] = playerState;

    return playerState;
  }

  private createPlayerStateIfNotExists(player: PlayerInfo): ExtendedPlayerGameState {
    return this.getPlayerState(player);
  }

  private getPlayerStates(connected = true): IMap<ExtendedPlayerGameState> {
    if (!connected) {
      return this._playerData;
    }
    const playerStates: IMap<ExtendedPlayerGameState> = {};
    Object.entries(this._playerData).forEach(([name, playerState]) => {
      if (playerState.player.connected) {
        playerStates[name] = playerState;
      }
    });
    return playerStates;
  }

  public get dealer(): Maybe<Player> {
    const foundDealer = this.getPlayers(false).find((e) => e.name === this._dealer?.name);
    if (!foundDealer) {
      return null;
    }

    return foundDealer;
  }

  public async joinGame(player: Player) {
    const couldJoin = super.joinGame(player);

    if (!couldJoin) {
      return false;
    }

    this.createPlayerStateIfNotExists(player);
    return true;
  }

  public async removePlayerFromGame(player: Player) {
    const shouldDestroy = await super.removePlayerFromGame(player);

    if (shouldDestroy) {
      return shouldDestroy;
    }

    if (this.getPlayers(true).length < 2) {
      this.gotoLobby();
    }

    this.sendGameState();

    return false;
  }

  private createPlayerGameSateForDto() {
    const choices = this.getPlayerStates(true);
    const states: IMap<PlayerGameState> = {};

    Object.entries(choices).forEach(([name, playerState]) => {
      if (playerState.player.connected) {
        states[name] = {
          score: playerState.score,
          likes: playerState.likes,
          timesChosen: playerState.timesChosen,
        };
      }
    });

    return states;
  }

  public currentGameState(): DuoToDGameState {
    const ownerPlayer = this.owner;
    const safePlayerList = this.getPlayers(true).map((e) => ({
      name: e.name,
      owner: e === ownerPlayer,
    }));
    const state: DuoToDGameState = {
      type: this.type,
      gameCode: this.code,
      started: this.started,
      owner: ownerPlayer.socket.id,
      players: safePlayerList,
      state: this._roundState,
      dealer: toPlayerInfo(this.dealer),
      currentRound: this._currentRound,
      playerStates: this.createPlayerGameSateForDto(),
      questionPointValues: this._questionPointValues
    };

    return state;
  }

  public sendGameState = () => {
    const currentState = this.currentGameState();
    const dto: CompleteDuoGameStateDto = {
      ...currentState
    };
    logger.debug(`Sending game state to all players in ${this.code}`);

    const socket = this.getRoomSocket();
    socket.emit("completeGameState", dto);
  };

  public async startGame() {
    super.startGame();
    this._dealer = this.owner;
  }

  public async gotoLobby() {
    this._roundState = "waiting";
    this._started = false;
  }

  private getOtherPlayer() {
    const otherPlayer = this.getPlayers(true).filter(e => e.name !== this.dealer?.name)[0];
    return otherPlayer;
  }

  public async newRound() {
    // choose round type
    const newRoundBase = this._game.nextRound();

    if (!this._dealer) {
      this._dealer = this.owner;
    }
    if (!this.dealer) {
      throw Error(`no dealer?`);
    }

    const dealerAsPlayerInfo = toExistingPlayerInfo(this.dealer);
    const otherPlayerAsPlayerInfo = toExistingPlayerInfo(this.getOtherPlayer());

    const newRound: DuoRound = {
      ...newRoundBase,
      playerOrder: [dealerAsPlayerInfo, otherPlayerAsPlayerInfo],
      turn: 0
    }

    this._roundState = "points";
    this._currentRound = newRound;
  }

  private playerChoseHighPointQuestion(index: number) {
    if (!this._currentRound) {
      throw Error("no current round!");
    }

    this._roundState = "choosing";

    // set question point values
    const otherQuestionIndex = (index + 1) % 2;

    this._currentRound.questionPoints = [0, 0];
    this._currentRound.questionPoints[index] = this._questionPointValues[0];
    this._currentRound.questionPoints[otherQuestionIndex] = this._questionPointValues[1];
  }

  private playerChoseQuestionToAsk(index: number) {
    if (!this._currentRound) {
      throw Error("no current round!");
    }

    this._roundState = "asking";

    const questionOrder: number[] = this._currentRound.questionsToAsk ?? [];
    questionOrder.push(index);

    if (questionOrder.length + 1 === this._currentRound.questions.length) {
      // add the last question, super slow way but it works
      for (let i = 0; i < this._currentRound.questions.length; ++i) {
        if (questionOrder.findIndex((e) => e === i) === -1) {
          questionOrder.push(i);
        }
      }
    }

    logger.debug(
      `Question order for ${this.code} is now ${questionOrder.join(", ")}`
    );

    this._currentRound.questionsToAsk = questionOrder;
  }

  public async playerChoseQuestion(index: number) {
    if (this._roundState != "choosing" && this._roundState != 'points') {
      throw Error(`Not in correct state`);
    }
  
    if (this._roundState == 'points') {
      this.playerChoseHighPointQuestion(index);
      return;
    }
    
    if (this._roundState == "choosing") {
      this.playerChoseQuestionToAsk(index);
      return;
    }

    throw Error(`this shouldn't happen :/`);
  }

  private chooseNextDealer(): PlayerInfo {
    const otherPlayer = this.getOtherPlayer();

    return otherPlayer;
  }

  protected async addToPlayerScore(player: PlayerInfo, score: number) {
    const playerState = this.getPlayerState(player);
    const currentScore = playerState.score;
    let newScore = currentScore !== undefined ? currentScore : 0;
    newScore += score;

    logger.debug(`${player.name} score ${currentScore} -> ${newScore}`);

    playerState.score = newScore;
  }

  public async playerAnsweredQuestion(didAnswer: boolean, player: PlayerInfo) {
    if (this._roundState != "asking") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    if (this._currentRound.turn === undefined || this._currentRound.questionPoints === undefined) {
      throw Error("invalid game state");
    }

    const askingPlayer = this._currentRound.playerOrder[
      (this._currentRound.turn + 1) % 2
    ];
    const answeringPlayer = this._currentRound.playerOrder[this._currentRound.turn];

    if (answeringPlayer.name !== player.name) {
      logger.warn(`Ignoring player answer since it's the wrong player`);
      return;
    }

    const pointsForAnswering = this._currentRound.questionPoints[this._currentRound.turn];

    this.addToPlayerScore(
      answeringPlayer,
      didAnswer ? pointsForAnswering : pointsForSkipping
    );

    const nextTurn = this._currentRound.turn + 1;

    if (nextTurn >= this._currentRound.questions.length) {
      // out of questions in this round, goto scores
      this._roundState = "scores";
      this._dealer = this.chooseNextDealer();
      return;
    }

    // Go to the next turn
    this._currentRound.turn = nextTurn;
  }

  public async startNextRound() {
    if (this._roundState != "scores") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    this.newRound();
  }

}

export const createDuoGameState = (
  code: string,
  originalOwner: Player,
  destroyCallback: Function,
  decks?: string[]
) => {
  return new DuoGameState(code, originalOwner, destroyCallback, decks);
};
