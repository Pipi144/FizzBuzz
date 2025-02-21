import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";
import {
  TAddGameAttemptPayload,
  TCheckAnswerPayload,
  TGameAttempt,
} from "@/models/gameAttempt";
import { TGameQuestion } from "@/models/gameQuestion";
import { TServerError } from "@/models/ServerErrorRespond";

// Mock Data
export const mockGameAttempt: TGameAttempt = {
  attemptId: "1",
  gameId: "game_123",
  attemptByUserId: "user_123",
  score: 0,
  attemptByUser: {
    userId: "user_123",
    username: "user123",
  },
  attemptedDate: new Date().toISOString(),
  gameQuestions: [],
};

export const mockGameQuestion: TGameQuestion = {
  id: "q1",
  gameAttemptId: "1",
  questionNumber: 100,
  userAnswer: "hello",
  isCorrectAnswer: false,
};

export const mockAttemptServerError: TServerError = {
  message: "Server Error",
  statusCode: 500,
  detailed: "Something went wrong",
  type: "Server Error",
};

// **Game Attempt Handlers**
export const gameAttemptHandlers = [
  // Mock Get Game Attempt API
  http.get(`${baseAddress}/api/game-attempt/:attemptId`, async ({ params }) => {
    const { attemptId } = params;
    if (attemptId === mockGameAttempt.attemptId) {
      return HttpResponse.json(mockGameAttempt, { status: 200 });
    }
    return HttpResponse.json(mockAttemptServerError, { status: 404 });
  }),

  // Mock Create Game Attempt API
  http.post(`${baseAddress}/api/game-attempt`, async ({ request }) => {
    const payload = (await request.json()) as TAddGameAttemptPayload;

    if (payload.gameId === mockGameAttempt.gameId) {
      return HttpResponse.json(mockGameAttempt, { status: 201 });
    }

    return HttpResponse.json(mockAttemptServerError, { status: 400 });
  }),

  // Mock Generate Game Question API
  http.get(
    `${baseAddress}/api/game-attempt/generate-question/:gameAttemptId`,
    async ({ params }) => {
      const { gameAttemptId } = params;
      if (gameAttemptId === mockGameAttempt.attemptId) {
        return HttpResponse.json(mockGameQuestion, { status: 200 });
      }
      return HttpResponse.json(mockAttemptServerError, { status: 404 });
    }
  ),

  // Mock Check Answer API
  http.post(`${baseAddress}/api/game-attempt/check`, async ({ request }) => {
    const payload = (await request.json()) as TCheckAnswerPayload;

    if (payload.answer === mockGameQuestion.userAnswer) {
      return HttpResponse.json(mockGameQuestion, { status: 200 });
    }

    return HttpResponse.json(mockAttemptServerError, { status: 500 });
  }),
];
