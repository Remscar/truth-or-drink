export interface PlayerInfo {
  name: string;
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

export interface CompleteGameStateDto extends Dto {
  gameCode: string;
  owner: string;
  started: boolean;
  players: PlayerInfo[];
}

export interface LeaveGameDto extends Dto {

}
