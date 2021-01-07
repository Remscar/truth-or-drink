
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

export const shuffleArray = <T>(array: T[]) => {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const generateGameCode = () => {
  const desiredCodeLength = 4;
  const digitOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  while (code.length < desiredCodeLength) {
    const randomDigit = digitOptions[Math.floor(Math.random() * digitOptions.length)];
    code = code + randomDigit;
  }

  return code;
}