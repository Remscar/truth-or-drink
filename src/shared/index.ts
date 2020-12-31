type Maybe<T> = T | null;

export type DeckTypes = "spicy" | "rocks";

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
  likedAnswers?:  {[name: string]: string[]}
}

export interface ToDGameState {
  gameCode: string;
  owner: string;
  started: boolean;
  players: PlayerInfo[];
  state: RoundState;
  dealer: Maybe<PlayerInfo>;
  currentRound: Maybe<Round>;
  scores: {[name: string]: number | undefined}
  likes: {[name: string]: number | undefined}
  playerChoices: PlayerInfo[];
}

export interface CompleteGameStateDto extends Dto, ToDGameState {
}

export interface Dto {
  error?: string;
}

export interface CreateDto extends Dto {
  creator: PlayerInfo;
  decks?: DeckTypes[];
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

export interface PlayerAnswerLikedDto extends Dto {
  player: PlayerInfo
}

export interface PlayerChoseWinnerDto extends Dto {
  winner: PlayerInfo
}

export interface PlayerStartNextRound extends Dto {
  
}