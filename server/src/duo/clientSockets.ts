import { join } from "path";
import { Socket } from "socket.io";
import { ChoseQuestionDto, CreatedDto, CreateDto, getLogger, IMap, JoinDto, JoinedDto, Maybe, PlayerAnsweredDto, PlayerAnswerLikedDto, PlayerChoseWinnerDto, SelectedPlayersDto } from "../../util";
import { createPlayer, Player } from "../player";
import { duoGameManager } from "./games";
import { DuoGameState } from "./gameState";

const logger = getLogger("partyclientSockets");


export const registerNewDuoClientConnection = (socket: Socket) => {
  logger.debug(`Setting up event handlers on new client socket. ${socket.id}`);

  let player: Maybe<Player> = null;
  let game: Maybe<DuoGameState> = null;

  socket.on('create', async (data: CreateDto) => {
    logger.log(`${data.creator.name} requests to create a game.`);

    player = createPlayer(data.creator.name, socket);
    const createdGame = await duoGameManager.createNewGame(player, data.decks);

    const response: CreatedDto = {
      ...createdGame.currentGameState()
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
    
    let joinedGame: Maybe<DuoGameState> = null;
    try {
      joinedGame = await duoGameManager.joinGame(data.gameCode, player);
      logger.log(`${data.player.name} has joined game ${data.gameCode}`);
      success = true;
    } catch (e) {
      logger.log(`${data.player.name} failed to join game ${data.gameCode}: ${e}`);
      error = e.message;
    }

    let response: JoinedDto = {
      success,
      error,
      state: joinedGame ? joinedGame.currentGameState() : null
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
    await game.playersChosen(data.players);

    game.sendGameState();
  });

  socket.on('choseQuestion', async (data: ChoseQuestionDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} chose question ${data.index}`);

    // no security for now, will add later (maybe?), hack me

    await game.playerChoseQuestion(data.index);

    game.sendGameState();
  });

  socket.on('playerAnswered', async (data: PlayerAnsweredDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} says that ${data.player.name} ${data.didAnswer ? "did" : "did not"} answer the question.`);

    // no security here either, i'm on a timeline here

    await game.playerAnsweredQuestion(data.didAnswer, data.player);

    game.sendGameState();

  })

  socket.on('playerChoseWinner', async (data: PlayerChoseWinnerDto) => {

    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} chose ${data.winner.name} as the winner`);

    await game.playerChoseWinner(data.winner);

    game.sendGameState();
  });

  socket.on('playerStartNextRound', async () => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} is starting the next round`);

    await game.startNextRound();

    game.sendGameState();
  });

  socket.on('playerAnswerLiked', async (data: PlayerAnswerLikedDto) => {
    if (!player || !game) {
      return;
    }

    logger.log(`${player.name} liked ${data.player.name}'s answer`);

    await game.playerLikedAnswer(player, data.player);
  })


}


