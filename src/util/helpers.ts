import { PlayerInfo } from "../shared"

export const playerEquals = (a: PlayerInfo, b: PlayerInfo): boolean => {
  return a.name === b.name;
}