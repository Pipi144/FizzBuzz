import { TBasicGameRule, TGameRule } from "./gameRule";
import { TUser } from "./user";

export type TBasicGame = {
  gameId: string;
  gameName: string;
  timeLimit: number;
  numberRange: number;
  createdAt: string;
  createdByUserId: string;
};

export type TGame = TBasicGame & {
  user: TUser;
  gameRules: TGameRule[];
};

export type TGetGameParams = {
  createdByUserId?: string;
  gameName?: string;
};

export type TAddGamePayload = {
  gameName: string;
  timeLimit: number;
  createdByUserId: string;
  numberRange: number;
  gameRules: TBasicGameRule[];
};

export type TUpdateGamePayload = Partial<
  Pick<TAddGamePayload, "gameName" | "timeLimit" | "numberRange">
> &
  Pick<TBasicGame, "gameId">;
