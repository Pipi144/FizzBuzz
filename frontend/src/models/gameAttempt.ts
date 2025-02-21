import { TGameQuestion } from "./gameQuestion";
import { TUser } from "./user";

export type TGameAttempt = {
  attemptId: string;

  score: number;
  gameId: string;
  attemptedDate: string;
  attemptByUserId: string;
  attemptByUser: TUser;
  gameQuestions: TGameQuestion[];
};

export type TAddGameAttemptPayload = {
  gameId: string;
  attemptByUserId: string;
};

export type TCheckAnswerPayload = {
  questionId: string;
  answer: string;
};
