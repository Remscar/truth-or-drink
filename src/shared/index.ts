type Maybe<T> = T | null;

export interface PlayerInfo {
  name: string;
  owner?: boolean;
}

export type RoundState = "waiting" | "choosing";

export interface Round {
  questions: [string, string];
}

export interface ToDGameState {
  gameCode: string;
  owner: string;
  started: boolean;
  players: PlayerInfo[];
  state: RoundState;
  dealer: Maybe<PlayerInfo>;
  currentRound: Maybe<Round>;
}

export interface CompleteGameStateDto extends Dto, ToDGameState {
}

export interface Dto {
  error?: string;
}

export interface CreateDto extends Dto {
  creator: PlayerInfo;
}

export interface CreatedDto extends CompleteGameStateDto {

}

export interface JoinDto extends Dto {
  player: PlayerInfo;
  gameCode: string;
}

export interface JoinedDto extends Dto {
  success: boolean;
  state: Maybe<ToDGameState>;
}



export interface LeaveGameDto extends Dto {

}
