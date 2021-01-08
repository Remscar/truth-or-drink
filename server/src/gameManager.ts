
import { GameType, getLogger, Maybe } from "../util";
import { generateGameCode } from "../util/helpers";
import { BaseGameState } from "./baseGameState";
import { createDuoGameState } from "./duo/gameState";
import { createPartyGameState } from "./party";
import { Player } from "./player";

const logger = getLogger("games");

const games: Map<string, BaseGameState> = new Map<string, BaseGameState>();


const getGame = (gameCode: string) => {
  return games.get(gameCode);
}

const createNewGame = async (type: GameType, creator: Player, decks?: string[]) => {
  const gameCode = generateGameCode();

  logger.log(`Creating game for ${creator.name} with code ${gameCode}`);

  let newGameState: Maybe<BaseGameState> = null;
  if (!games.has(gameCode)) {
    if (type === 'duo') {
      newGameState = createDuoGameState(gameCode, creator, destroyGame, decks);
    } else {
      newGameState = createPartyGameState(gameCode, creator, destroyGame, decks);
    }
    
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