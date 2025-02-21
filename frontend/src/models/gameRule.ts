export type TBasicGameRule = {
  divisibleNumber: number;
  replacedWord: string;
};

export type TGameRule = TBasicGameRule & {
  ruleId: string;
  gameId: string;
};

export type TUpdateGameRulePayload = Partial<TBasicGameRule> & {
  ruleId: string;
};

export type TAddGameRulePayload = TBasicGameRule & {
  gameId: string;
};
