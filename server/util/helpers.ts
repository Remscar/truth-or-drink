
import { Maybe, PlayerInfo } from ".";
import { Player } from "../src/player";

export const randomElementFromArray = <T extends any>(arr: Array<T>): T => {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function toExistingPlayerInfo(player: Player): PlayerInfo  {
  const safeInfo = {
    name: player.name
  } as PlayerInfo;

  return safeInfo;
}

export function toPlayerInfo(player: Maybe<Player>): Maybe<PlayerInfo> {
  if (!player) {
    return null;
  }

  const safeInfo = {
    name: player.name
  } as PlayerInfo;

  return safeInfo;
}
