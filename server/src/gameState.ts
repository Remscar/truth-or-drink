import {
  CompleteGameStateDto,
  getLogger,
  Maybe,
  PlayerInfo,
  Round,
  RoundState,
  ToDGameState,
} from "../util";
import { randomElementFromArray, toExistingPlayerInfo, toPlayerInfo } from "../util/helpers";
import { BaseGameState } from "./baseGameState";
import { Player } from "./player";
import { getRoundData } from "./todGame";

const logger = getLogger("gameState");

const pointsForSkipping = -5;
const pointsForAnswering = 0;
const pointsForWinning = 5;
const pointsForLiking = 1;

export class GameState extends BaseGameState {
  private _dealer: Maybe<PlayerInfo> = null;
  private _roundState: RoundState = "waiting";

  private _currentRound: Maybe<Round> = null;

  private _scores: { [name: string]: number | undefined } = {};
  private _likes: { [name: string]: number | undefined } = {};
  private _timesChosen: { [name: string]: number | undefined } = {};
  private _playerChoices: PlayerInfo[] = [];

  private _lastDealer: Maybe<PlayerInfo> = null;

  private _someoneSkippedAnswering = false;

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

  public async joinGame(player: Player) {
    const couldJoin = super.joinGame(player);

    if (!couldJoin) {
      return false;
    }

    if (!this._scores[player.name]) {
      this._scores[player.name] = 0;
    }

    if (!this._likes[player.name]) {
      this._likes[player.name] = 0;
    }

    if (!this._timesChosen[player.name]) {
      this._timesChosen[player.name] = 0;
    }

    this.calculatePlayerChoices();

    return true;
  }

  public async removePlayerFromGame(player: Player) {
    const shouldDestroy = await super.removePlayerFromGame(player);

    this._scores[player.name] = undefined;
    this._likes[player.name] = undefined;

    this.sendGameState();

    if (shouldDestroy) {
      return shouldDestroy;
    }

    this.calculatePlayerChoices();

    if (this._dealer?.name === player.name) {
      this._dealer = this.players[0];
      this.newRound();
      this.sendGameState();
    } else if (this._currentRound && this._currentRound.players) {
      const foundIndex = this._currentRound.players.findIndex(
        (e) => e.name === player.name
      );
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
      currentRound: this._currentRound,
      scores: this._scores,
      likes: this._likes,
      playerChoices: this._playerChoices.map((e) => ({name: e.name}))
    };

    return state;
  }

  public sendGameState = () => {
    const currentState = this.currentGameState();
    const dto: CompleteGameStateDto = {
      ...currentState,
    };
    logger.debug(`Sending game state to all players in ${this.code}`);

    const socket = this.getRoomSocket();
    socket.emit("completeGameState", dto);
  };

  public async startGame() {
    super.startGame();
    this._dealer = this.owner;
  }

  protected calculatePlayerChoices() {
    const minNumberPlayers = 3;
    let maxNumTimesChosen = 1;
    let playerOptions: string[] = [];

    const playerChosenArray = Object.entries(this._timesChosen).map(([player, timesChosen]) => ({
      player,
      timesChosen: timesChosen as number
    }));

    if (playerChosenArray.length <= minNumberPlayers) {
      playerOptions = playerChosenArray.map(e => e.player);
    } else {
      while (playerOptions.length < minNumberPlayers) {
        const choosablePlayers = playerChosenArray.filter(e => e.timesChosen < maxNumTimesChosen);
  
        if (choosablePlayers.length === 0) {
          ++maxNumTimesChosen;
          continue
        }
  
        // We have less than needed # of players left to choose from
        if (choosablePlayers.length < minNumberPlayers) {
          playerOptions = playerOptions.concat(choosablePlayers.map(e => e.player));
          const numAlreadyChosen = playerOptions.length;
          const extraChoices = minNumberPlayers - numAlreadyChosen
  
          const extraPlayers = playerChosenArray.filter(e => e.timesChosen >= maxNumTimesChosen);
          for (let i = 0; i < extraChoices && i < extraPlayers.length; ++i) {
            playerOptions.push(extraPlayers[i].player);
          }
  
          break
        }
  
        playerOptions = choosablePlayers.map(e => e.player);
      }
    }

    this._playerChoices = playerOptions.map(e => ({name: e}));
  }

  public async newRound() {
    // choose round type
    const newRound = getRoundData();

    this.calculatePlayerChoices();
    this._roundState = "dealing";
    this._currentRound = newRound;

    this._someoneSkippedAnswering = false;
  }

  public async playersChosen(players: PlayerInfo[]) {
    if (this._roundState != "dealing") {
      throw Error(`Not choosing state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    logger.debug(`Players chosen for ${this.code}`);

    this._currentRound.players = players;
    this._currentRound.turn = 0;
    this._roundState = "choosing";
    
    for (const player of players) {
      let timesChosen = this._timesChosen[player.name] || 0;
      timesChosen += 1;
      this._timesChosen[player.name] = timesChosen;
    }
  }

  public async playerChoseQuestion(index: number) {
    if (this._roundState != "choosing") {
      throw Error(`Not choosing state`);
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

  private chooseNextDealer(): PlayerInfo {
    const dealerOptions = Object.assign([], this.players) as Player[];
    if (this._lastDealer) {
      const lastDealerName = this._lastDealer.name;
      const dealerIndex = dealerOptions.findIndex((e) => e.name === lastDealerName);
      if (dealerIndex > -1) {
        dealerOptions.splice(dealerIndex, 1);
      }
    }
    const nextDealer = randomElementFromArray(dealerOptions);
    return nextDealer;
  }

  protected async addToPlayerScore(player: PlayerInfo, score: number) {
    const currentScore = this._scores[player.name];
    let newScore = currentScore !== undefined ? currentScore : 0;
    newScore += score;

    logger.debug(`${player.name} score ${currentScore} -> ${newScore}`);

    this._scores[player.name] = newScore;
  }

  protected async addToPlayerLikes(player: PlayerInfo, likes: number) {
    const currentScore = this._likes[player.name];
    let newLikes = currentScore !== undefined ? currentScore : 0;
    newLikes += likes;

    this._likes[player.name] = newLikes;
  }

  public async playerAnsweredQuestion(didAnswer: boolean) {
    if (this._roundState != "asking") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    if (this._currentRound.turn === undefined || !this._currentRound.players) {
      throw Error("invalid game state");
    }

    const answeringPlayer = this._currentRound.players[(this._currentRound.turn + 1) % 2];
    const otherPlayer = this._currentRound.players[this._currentRound.turn];

    this.addToPlayerScore(answeringPlayer, didAnswer ? pointsForAnswering : pointsForSkipping);

    if (!didAnswer) {
      this.addToPlayerScore(otherPlayer, pointsForWinning);
    }

    const nextTurn = this._currentRound.turn + 1;

    if (!didAnswer) {
      this._someoneSkippedAnswering = true;
    }

    if (nextTurn >= this._currentRound.questions.length) {
      // out of questions in this round, so onto the next

      if (this._someoneSkippedAnswering) {
        this._lastDealer = this._dealer;
        this._dealer = this.chooseNextDealer();
        

        this._roundState = "scores";
      } else {
        this._roundState = "scoring";
      }
      return;
    }

    // Go to the next turn
    this._currentRound.turn = nextTurn;
  }

  public async playerChoseWinner(winner: PlayerInfo) {
    if (this._roundState != "scoring") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    this.addToPlayerScore(winner, pointsForWinning);

    logger.debug(`${winner.name} won the round.`);

    this._lastDealer = this._dealer;
    this._dealer = this.chooseNextDealer();

    this._roundState = "scores";
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

  private getLikedAnswers() {
    if (!this._currentRound) {
      throw Error("no current round!");
    }

    if (!this._currentRound.likedAnswers) {
      this._currentRound.likedAnswers = {}
    }

    return this._currentRound.likedAnswers;
  }

  private getPlayersLikedAnswers(player: PlayerInfo) {
    const likedAnswers = this.getLikedAnswers();
    if (!likedAnswers[player.name]) {
      likedAnswers[player.name] = []
    }

    return likedAnswers[player.name];
  }

  public async playerLikedAnswer(player: PlayerInfo, likedPlayer: PlayerInfo) {
    if (this._roundState != "scoring" && this._roundState != "asking") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    const playerAnswers = this.getPlayersLikedAnswers(player);
    if (playerAnswers.findIndex((e) => e === likedPlayer.name) < 0) {
      playerAnswers.push(likedPlayer.name);
      this.addToPlayerScore(likedPlayer, pointsForLiking);
      this.addToPlayerLikes(likedPlayer, 1);
    } else {
      logger.debug(`${player.name} already voted for ${likedPlayer.name}`)
    }
  }
}

export const createGameState = (code: string, originalOwner: Player) => {
  return new GameState(code, originalOwner);
};
