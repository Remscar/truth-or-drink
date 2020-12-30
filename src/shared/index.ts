type Maybe<T> = T | null;

export interface PlayerInfo {
  name: string;
  owner?: boolean;
}

export interface Dto {
  error?: string;
}

export interface CreateDto extends Dto {
  creator: PlayerInfo;
}

export interface CreatedDto extends Dto {
  gameCode: string;
}

export interface JoinDto extends Dto {
  player: PlayerInfo;
  gameCode: string;
}

export interface JoinedDto extends Dto {
  success: boolean;
}

export type RoundState = "waiting" | "start";

export interface Round {
  questions: [string, string];
}

export interface CompleteGameStateDto extends Dto {
  gameCode: string;
  owner: string;
  started: boolean;
  players: PlayerInfo[];
  state: RoundState;
  dealer: Maybe<PlayerInfo>;
  currentRound: Maybe<Round>;
}

export interface LeaveGameDto extends Dto {

}
