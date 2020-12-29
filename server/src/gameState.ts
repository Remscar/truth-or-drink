import { Player } from "./player";


export interface GameState {
  code: string;
  owner: Player;
  players: Player[];
  joinGame: (player: Player) => Promise<boolean>
}

export const createGameState = (code: string, owner: Player) => {
  const players: Player[] = [];

  const joinGame = async (player: Player) => {
    player.socket.rooms.clear();
    player.socket.rooms.add(code);
    players.push(player);

    return true;
  }

  const newGameState: GameState = {
    code,
    owner,
    players,
    joinGame
  }

  newGameState.players.push(owner);

  return newGameState;
}
