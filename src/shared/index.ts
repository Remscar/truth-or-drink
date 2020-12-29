export interface PlayerInfo {
  name: string;
}

export interface Dto {
  error?: string;
}

export interface CreateDto extends Dto {
  creator: PlayerInfo
}

export interface CreatedDto extends Dto {
  gameCode: string;
}