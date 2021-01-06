type Maybe<T> = T | null;
type IMap<T> = {[key: string] : T};

export const DeckTypes = {
  Spicy: "spicy",
  Rocks: "rocks",
  Happy: "happy",
  PG: "pg",
  PG13: "pg13",
  RatedR: "ratedr",
  Friends: "friends",
  OverText: "overtext",
  WildCards: "wildcards",
  WildCards2: "wildcards2",
}

export interface PlayerInfo {
  name: string;
  owner?: boolean;
}

export interface PlayerGameState {
  score: number;
  likes: number;
  timesChosen: number;
}

export type RoundState = "waiting" | "dealing" | "choosing" | "asking" | "scoring" | "scores";
export type DuoRoundState = "waiting" | "choosing" | "asking" |  "scores";



export interface Round {
  questions: [string, string];
  players?: PlayerInfo[];
  turn?: number;
  questionsToAsk?: number[];
  likedAnswers?:  {[name: string]: string[]}
  likesForPlayers?: number[];
}

export interface ToDGameState {
  gameCode: string;
  owner: string;
  started: boolean;
  players: PlayerInfo[];
  state: RoundState;
  dealer: Maybe<PlayerInfo>;
  currentRound: Maybe<Round>;
  playerChoices: PlayerInfo[];
  playerStates: IMap<PlayerGameState>;
  someoneSkipped: boolean;
  timerEnd: number;
  winnerChosen: boolean;
}

export interface CompleteGameStateDto extends Dto, ToDGameState {
}

export interface DuoRound {
  questions: [string, string];
  questionPoints: [number, number];
  questionsToAsk?: number[];
  playerOrder: [PlayerInfo, PlayerInfo];
  turn?: number;
}

export interface DuoToDGameState {
  gameCode: string;
  owner: string;
  started: boolean;
  players: PlayerInfo[];
  state: DuoRoundState;
  questionPointValues: number[];
  currentRound: Maybe<DuoRound>;
  playerStates: IMap<PlayerGameState>;
}

export interface CompleteDuoGameStateDto extends Dto, DuoToDGameState {

}

export interface Dto {
  error?: string;
}

export interface CreateDto extends Dto {
  creator: PlayerInfo;
  decks?: string[];
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
  player: PlayerInfo
}

export interface PlayerAnswerLikedDto extends Dto {
  player: PlayerInfo
}

export interface PlayerChoseWinnerDto extends Dto {
  winner: PlayerInfo
}

export interface PlayerStartNextRound extends Dto {
  
}