import { GameState } from ".";
import { getLogger, IMap, PlayerInfo } from "../util";
import { createGameState } from "./gameState";
import { Player } from "./player";

const logger = getLogger("games");

const games: IMap<GameState> = {};


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

const gameExists = (gameCode: string) => {
  return games[gameCode] !== undefined;
}

const getGame = (gameCode: string) => {
  return games[gameCode];
}

const createNewGame = async (creator: Player) => {
  const gameCode = generateGameCode();

  logger.log(`Creating game for ${creator.name} with code ${gameCode}`);

  const newGameState = createGameState(gameCode, creator);
  games[gameCode] = newGameState;

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
  gameState.joinGame(player);

  return gameState;
}


export const gameManager = {
  createNewGame,
  joinGame
}