import { GameState } from ".";
import { getLogger, IMap, Maybe, PlayerInfo } from "../util";
import { createGameState } from "./gameState";
import { Player } from "./player";

const logger = getLogger("games");

const games: Map<string, GameState> = new Map<string, GameState>();


const generateGameCode = () => {
  const desiredCodeLength = 4;
  const digitOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  while (code.length < desiredCodeLength) {
    const randomDigit = digitOptions[Math.floor(Math.random() * digitOptions.length)];
    code = code + randomDigit;
  }

  return code;
}

const getGame = (gameCode: string) => {
  return games.get(gameCode);
}

const createNewGame = async (creator: Player) => {
  const gameCode = generateGameCode();

  logger.log(`Creating game for ${creator.name} with code ${gameCode}`);

  let newGameState: Maybe<GameState> = null;
  if (!games.has(gameCode)) {
    newGameState = createGameState(gameCode, creator);
    games.set(gameCode, newGameState);
  } else {
    const game = games.get(gameCode);
    if (!game) {
      throw Error("impossible");
    }
    newGameState = game;
  }

  await joinGame(gameCode, creator);

  return newGameState;
}

const joinGame = async (gameCode: string, player: Player) => {
  const gameState = getGame(gameCode);
  if (!gameState) {
    const errorMsg = `No game ${gameCode} found.`;
    throw Error(errorMsg);
  }

  logger.log(`${player.name} joining game ${gameCode}`);
  await gameState.joinGame(player);

  return gameState;
}

const destroyGame = async (gameCode: string) => {
  logger.log(`Destroying game ${gameCode}`);
  games.delete(gameCode);
}


export const gameManager = {
  createNewGame,
  joinGame,
  destroyGame
}