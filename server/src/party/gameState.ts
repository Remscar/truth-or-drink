import {
  CompleteGameStateDto,
  DeckTypes,
  getLogger,
  IMap,
  Maybe,
  PartyRound,
  PlayerGameState,
  PlayerInfo,
  RoundState,
  ToDGameState,
} from "../../util";
import {
  randomElementFromArray,
  shuffleArray,
  toPlayerInfo,
} from "../../util/helpers";
import { BaseGameState } from "../baseGameState";
import { Player } from "../player";
import { TruthOrDrinkGame } from "../todGame";

const logger = getLogger("party::gameState");

const pointsForSkipping = -5;
const pointsForAnswering = 0;
const pointsForWinning = 5;
const pointsForLiking = 1;
const minimumVotingDuration = 10;

interface ExtendedPlayerGameState extends PlayerGameState {
  player: Player;
}

export class PartyGameState extends BaseGameState {
  private _dealer: Maybe<PlayerInfo> = null;
  private _roundState: RoundState = "waiting";

  private _currentRound: Maybe<PartyRound> = null;

  private _playerData: IMap<ExtendedPlayerGameState> = {};

  private _playerChoices: PlayerInfo[] = [];

  private _lastDealer: Maybe<PlayerInfo> = null;

  private _someoneSkippedAnswering = false;
  private _winnerChosen = false;

  private _game: TruthOrDrinkGame;

  private _timerEnd: number = 0;

  public constructor(public code: string, owner: Player, destroyCallback: Function, decks?: string[]) {
    super('party', code, owner, destroyCallback);

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

    const state = this.createPlayerStateIfNotExists(player);
    const fewestTimesAPlayerHasBeenChosen = this.getFewestTimesChosen();
    state.timesChosen = Math.max(fewestTimesAPlayerHasBeenChosen, state.timesChosen);

    this.calculatePlayerChoices();

    return true;
  }

  public async removePlayerFromGame(player: Player) {
    const shouldDestroy = await super.removePlayerFromGame(player);

    if (shouldDestroy) {
      return shouldDestroy;
    }

    this.calculatePlayerChoices();

    if (this._dealer?.name === player.name) {
      this._dealer = this.getPlayers(true)[0];
      this.newRound();
    } else if (this._currentRound && this._currentRound.players) {
      const foundIndex = this._currentRound.players.findIndex(
        (e) => e.name === player.name
      );
      if (foundIndex > -1) {
        this.newRound();
      }
    }

    if (this.getPlayers(true).length < 3) {
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

  public currentGameState(): ToDGameState {
    const ownerPlayer = this.owner;
    const safePlayerList = this.getPlayers(true).map((e) => ({
      name: e.name,
      owner: e === ownerPlayer,
    }));
    const state = {
      type: this.type,
      gameCode: this.code,
      started: this.started,
      owner: ownerPlayer.socket.id,
      players: safePlayerList,
      state: this._roundState,
      dealer: toPlayerInfo(this.dealer),
      currentRound: this._currentRound,
      playerStates: this.createPlayerGameSateForDto(),
      playerChoices: this._playerChoices.map((e) => ({ name: e.name })),
      timerEnd: this._timerEnd,
      someoneSkipped: this._someoneSkippedAnswering,
      winnerChosen: this._winnerChosen
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

  private getFewestTimesChosen(): number {
    const playerStates = this.getPlayerStates(true);

    let fewestTimesChosen = 9999999;
    Object.values(playerStates).forEach(e => {
      if (e.timesChosen < fewestTimesChosen) {
        fewestTimesChosen = e.timesChosen;
      }
    })

    return fewestTimesChosen;
  }

  protected calculatePlayerChoices() {
    const minNumberPlayers = 3;
    let maxNumTimesChosen = this.getFewestTimesChosen();
    let playerOptions: string[] = [];

    const playerStates = this.getPlayerStates(true);

    const playerChosenArray = Object.entries(playerStates).map(
      ([player, playerState]) => ({
        player,
        timesChosen: playerState.timesChosen,
      })
    );
    shuffleArray(playerChosenArray);

    if (playerChosenArray.length <= minNumberPlayers) {
      playerOptions = playerChosenArray.map((e) => e.player);
    } else {
      while (playerOptions.length < minNumberPlayers) {
        const choosablePlayers = playerChosenArray.filter(
          (e) => e.timesChosen < maxNumTimesChosen
        );

        if (choosablePlayers.length === 0) {
          ++maxNumTimesChosen;
          continue;
        }

        // We have less than needed # of players left to choose from
        if (choosablePlayers.length < minNumberPlayers) {
          playerOptions = playerOptions.concat(
            choosablePlayers.map((e) => e.player)
          );
          const numAlreadyChosen = playerOptions.length;
          const extraChoices = minNumberPlayers - numAlreadyChosen;

          const extraPlayers = playerChosenArray.filter(
            (e) => e.timesChosen >= maxNumTimesChosen
          );
          for (let i = 0; i < extraChoices && i < extraPlayers.length; ++i) {
            playerOptions.push(extraPlayers[i].player);
          }

          break;
        }

        playerOptions = choosablePlayers.map((e) => e.player);
      }
    }

    this._playerChoices = playerOptions.map((e) => ({ name: e } as PlayerInfo));
  }

  public async gotoLobby() {
    this._roundState = "waiting";
    this._started = false;
  }

  public async newRound() {
    // choose round type
    const newRound = this._game.nextRound();

    this.calculatePlayerChoices();
    this._roundState = "dealing";
    this._currentRound = newRound;

    this._someoneSkippedAnswering = false;
    this._winnerChosen = false;
  }

  public async playersChosen(players: PlayerInfo[]) {
    if (this._roundState != "dealing") {
      throw Error(`Not choosing state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    logger.debug(`Players chosen for ${this.code}`);
    
    for (const player of players) {
      this.getPlayerState(player).timesChosen += 1;
    }

    this._currentRound.players = players;
    this._currentRound.turn = 0;
    this._roundState = "choosing";
    this._currentRound.likesForPlayers = this._currentRound.players.map(() => 0);
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
    const dealerOptions = Object.assign([], this.getPlayers()) as Player[];
    if (this._lastDealer) {
      const lastDealerName = this._lastDealer.name;
      const dealerIndex = dealerOptions.findIndex(
        (e) => e.name === lastDealerName
      );
      if (dealerIndex > -1) {
        dealerOptions.splice(dealerIndex, 1);
      }
    }
    const nextDealer = randomElementFromArray(dealerOptions);
    return nextDealer;
  }

  protected async addToPlayerScore(player: PlayerInfo, score: number) {
    const playerState = this.getPlayerState(player);
    const currentScore = playerState.score;
    let newScore = currentScore !== undefined ? currentScore : 0;
    newScore += score;

    logger.debug(`${player.name} score ${currentScore} -> ${newScore}`);

    playerState.score = newScore;
  }

  protected async addToPlayerLikes(player: PlayerInfo, likes: number) {
    const playerState = this.getPlayerState(player);
    const currentScore = playerState.likes;
    let newLikes = currentScore !== undefined ? currentScore : 0;
    newLikes += likes;

    playerState.likes = newLikes;
  }

  public async playerAnsweredQuestion(didAnswer: boolean, player: PlayerInfo) {
    if (this._roundState != "asking") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    if (this._currentRound.turn === undefined || !this._currentRound.players) {
      throw Error("invalid game state");
    }

    const answeringPlayer = this._currentRound.players[
      (this._currentRound.turn + 1) % 2
    ];
    const otherPlayer = this._currentRound.players[this._currentRound.turn];

    if (answeringPlayer.name !== player.name) {
      logger.warn(`Ignoring player answer since it's the wrong player`);
      return;
    }

    this.addToPlayerScore(
      answeringPlayer,
      didAnswer ? pointsForAnswering : pointsForSkipping
    );

    if (!didAnswer) {
      this.addToPlayerScore(otherPlayer, pointsForWinning);
    }

    const nextTurn = this._currentRound.turn + 1;

    if (!didAnswer) {
      this._someoneSkippedAnswering = true;
    }

    if (nextTurn >= this._currentRound.questions.length) {
      // out of questions in this round, so onto the next
      this.beginScoring();
      return;
    }

    // Go to the next turn
    this._currentRound.turn = nextTurn;
  }

  public async beginScoring() {
    this._roundState = "scoring";
  }

  public async startEndScoringCountdown() {
    this._timerEnd = Date.now() + minimumVotingDuration * 1000;
    this.sendGameState();
    setTimeout(() => {
      this.finishScoring();
      this.sendGameState();
    }, minimumVotingDuration * 1000 + 2500); // always have a little grace time
  }

  public async playerChoseWinner(winner: PlayerInfo) {
    if (this._roundState != "scoring") {
      throw Error(`Not in the asking state`);
    }

    if (!this._currentRound) {
      throw Error("no current round!");
    }

    if (this._someoneSkippedAnswering) {
      throw Error(`Can only choose winner if nobody skipped`);
    }

    if (this._winnerChosen) {
      throw Error(`Winner has already been chosen.`);
    }

    this._winnerChosen = true;

    this.addToPlayerScore(winner, pointsForWinning);

    logger.debug(`${winner.name} won the round.`);

    await this.startEndScoringCountdown();
  }

  public async finishScoring() {
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
      this._currentRound.likedAnswers = {};
    }

    return this._currentRound.likedAnswers;
  }

  private getPlayersLikedAnswers(player: PlayerInfo) {
    const likedAnswers = this.getLikedAnswers();
    if (!likedAnswers[player.name]) {
      likedAnswers[player.name] = [];
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

    if (!this._currentRound.likesForPlayers || !this._currentRound.players) {
      throw Error(`invalid game state.`);
    }

    const likedPlayerIndex = this._currentRound.players.findIndex(e => e.name === likedPlayer.name);
    if (likedPlayerIndex < 0) {
      throw Error(`Could not find liked player in current round`);
    }

    const playerAnswers = this.getPlayersLikedAnswers(player);
    if (playerAnswers.findIndex((e) => e === likedPlayer.name) < 0) {
      playerAnswers.push(likedPlayer.name);
      this.addToPlayerScore(likedPlayer, pointsForLiking);
      this.addToPlayerLikes(likedPlayer, 1);

      this._currentRound.likesForPlayers[likedPlayerIndex] += 1;
    } else {
      logger.debug(`${player.name} already voted for ${likedPlayer.name}`);
    }
  }
}

export const createPartyGameState = (
  code: string,
  originalOwner: Player,
  destroyCallback: Function,
  decks?: string[]
) => {
  return new PartyGameState(code, originalOwner, destroyCallback, decks);
};
