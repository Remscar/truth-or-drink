import { Socket } from "socket.io";
import { BaseToDGameState, ChoseQuestionDto, CreatedDto, CreateDto, getLogger, JoinDto, JoinedDto, Maybe, PlayerAnsweredDto, PlayerAnswerLikedDto, PlayerChoseWinnerDto, SelectedPlayersDto } from "../util";
import { BaseGameState } from "./baseGameState";
import { DuoGameState } from "./duo";
import { gameManager } from "./gameManager";
import { PartyGameState } from "./party";
import { createPlayer, Player } from "./player";

const logger = getLogger("clientSockets");


export const registerNewClientConnection = (socket: Socket) => {
  logger.debug(`Setting up event handlers on new client socket. ${socket.id}`);

  let player: Maybe<Player> = null;
  let game: Maybe<BaseGameState> = null;

  socket.on('create', async (data: CreateDto) => {
    logger.log(`${data.creator.name} requests to create a game.`);

    player = createPlayer(data.creator.name, socket);
    const createdGame = await gameManager.createNewGame(data.type, player, data.decks);

    let responseState: BaseToDGameState | undefined;

    if (createdGame.type === "duo") {
      responseState = {...(createdGame as DuoGameState).currentGameState()}
    } else {
      responseState = {...(createdGame as PartyGameState).currentGameState()}
    }

    const response: CreatedDto = {
      state: responseState
    }
    socket.emit('created', response);

    createdGame.sendGameState();
    game = createdGame;
  });

  socket.on('join', async (data: JoinDto) => {
    logger.log(`${data.player.name} requests to join game ${data.gameCode}`);

    player = createPlayer(data.player.name, socket);
    let success = false;
    let error = "";
    
    let joinedGame: Maybe<BaseGameState> = null;
    try {
      joinedGame = await gameManager.joinGame(data.gameCode, player);
      logger.log(`${data.player.name} has joined game ${data.gameCode}`);
      success = true;
    } catch (e) {
      logger.log(`${data.player.name} failed to join game ${data.gameCode}: ${e}`);
      error = e.message;
    }

    let state: Maybe<BaseToDGameState> = null;
    if (joinedGame) {
      if (joinedGame.type === "duo") {
        state = {...(joinedGame as DuoGameState).currentGameState()}
      } else {
        state = {...(joinedGame as PartyGameState).currentGameState()}
      }
    }

    let response: JoinedDto = {
      success,
      error,
      state
    }

    socket.emit('joined', response);

    if (joinedGame) {
      joinedGame.sendGameState();
      game = joinedGame;
    }
  });

  socket.on('disconnect', async () => {
    if (!player || !game) {
      return;
    }
    player.connected = false;

    await game.playerDisconnected(player);

    logger.log(`Socket of player ${player.name} ${socket.id} has disconnected.`);
  });

  socket.on('leaveGame', async () => {
    if (!player || !game) {
      return;
    }

    try {
      logger.log(`Player ${player.name} is leaving game ${game.code}`);

      const wasDestroyed = await game.removePlayerFromGame(player);
      if (!wasDestroyed) {
        game.sendGameState();
      }

      game = null;
      player = null;
    } catch (e) {
      logger.error(`Error: ${e}`);
    }

    
  });

  socket.on('startGame', async () => {
    if (!player || !game) {
      return;
    }

    if (game.owner.socket.id !== player.socket.id) {
      logger.warn(`${player.name} just is starting the game that they aren't the owner of.`);
      return;
    }

    await game.startGame();
    await game.newRound();

    game.sendGameState();
  });

  socket.on('selectedPlayers', async (data: SelectedPlayersDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} selected ${data.players.length} players`);

    // no security for now, should add later
    if (game.type === "duo") {
      //await (game as DuoGameState).playersChosen(data.players);
      throw Error(`invalid socket command for duo game.`);
    } else {
      await (game as PartyGameState).playersChosen(data.players);
    }

    game.sendGameState();
  });

  socket.on('choseQuestion', async (data: ChoseQuestionDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} chose question ${data.index}`);

    // no security for now, will add later (maybe?), hack me

    if (game.type === "duo") {
      await (game as DuoGameState).playerChoseQuestion(data.index);
    } else {
      await (game as PartyGameState).playerChoseQuestion(data.index);
    }

    game.sendGameState();
  });

  socket.on('playerAnswered', async (data: PlayerAnsweredDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} says that ${data.player.name} ${data.didAnswer ? "did" : "did not"} answer the question.`);

    // no security here either, i'm on a timeline here

    if (game.type === "duo") {
      await (game as DuoGameState).playerAnsweredQuestion(data.didAnswer, data.player);
    } else {
      await (game as PartyGameState).playerAnsweredQuestion(data.didAnswer, data.player);
    }

    game.sendGameState();

  })

  socket.on('playerChoseWinner', async (data: PlayerChoseWinnerDto) => {

    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} chose ${data.winner.name} as the winner`);

    if (game.type === "duo") {
      //await (game as DuoGameState).playerChoseWinner(data.winner);
      throw Error(`invalid socket command for duo game.`);
    } else {
      await (game as PartyGameState).playerChoseWinner(data.winner);
    }

    game.sendGameState();
  });

  socket.on('playerStartNextRound', async () => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} is starting the next round`);

    if (game.type === "duo") {
      await (game as DuoGameState).startNextRound();
    } else {
      await (game as PartyGameState).startNextRound();
    }

    game.sendGameState();
  });

  socket.on('playerAnswerLiked', async (data: PlayerAnswerLikedDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} liked ${data.player.name}'s answer`);

    if (game.type === "duo") {
      //await (game as DuoGameState).playerLikedAnswer(player, data.player);
      throw Error(`invalid socket command for duo game.`);
    } else {
      await (game as PartyGameState).playerLikedAnswer(player, data.player);
    }
  })


}


