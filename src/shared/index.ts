type Maybe<T> = T | null;

export interface PlayerInfo {
  name: string;
  owner?: boolean;
}

export type RoundState = "waiting" | "dealing" | "choosing" | "asking" | "scoring" | "scores";

export interface Round {
  questions: [string, string];
  players?: PlayerInfo[];
  turn?: number;
  questionsToAsk?: number[];
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

export interface SelectedPlayersDto extends Dto {
  players: PlayerInfo[]
}

export interface ChoseQuestionDto extends Dto {
  index: number
}

export interface PlayerAnsweredDto extends Dto {
  didAnswer: boolean
}

export interface PlayerLikedDto extends Dto {
  likedPlayed: PlayerInfo
}

export interface PlayerChoseWinnerDto extends Dto {
  winner: PlayerInfo
}

export interface NextRoundDto extends Dto {
  
}