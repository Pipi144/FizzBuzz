import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";
import { TAddGamePayload, TBasicGame, TGame } from "@/models/game";
import { TServerError } from "@/models/ServerErrorRespond";

export const mockGameBasicList: TBasicGame[] = [
  {
    gameId: "1",
    gameName: "Game 1",
    timeLimit: 10,
    numberRange: 100,
    createdAt: new Date("01/01/2023").toISOString(),
    createdByUserId: "1",
  },
  {
    gameId: "2",
    gameName: "Game 2",
    timeLimit: 20,
    numberRange: 100,
    createdAt: new Date("02/02/2023").toISOString(),
    createdByUserId: "2",
  },
];

export const mockGame: TGame = {
  gameId: "1",
  gameName: "Game 1",
  timeLimit: 10,
  numberRange: 100,
  createdAt: new Date().toISOString(),
  createdByUserId: "1",
  gameRules: [
    { divisibleNumber: 3, replacedWord: "Fizz", ruleId: "1", gameId: "1" },
  ],
  user: {
    userId: "1",
    username: "user1",
  },
};

export const mockGameServerError: TServerError = {
  message: "Network Error",
  statusCode: 500,
  detailed: "Failed to fetch game list",
  type: "Server Error",
};
export const gameHandlers = [
  // Mock get game list API
  http.get(`${baseAddress}/api/Game`, async ({ request }) => {
    const url = new URL(request.url);

    const createdByUserId = url.searchParams.get("createdByUserId");
    if (!createdByUserId || createdByUserId === "1") {
      return HttpResponse.json(mockGameBasicList, { status: 200 });
    } else return HttpResponse.json(mockGameServerError, { status: 401 });
  }),

  // mock add game api
  http.post(`${baseAddress}/api/Game`, async ({ request }) => {
    const payload = (await request.json()) as TAddGamePayload;

    if (payload.gameName === mockGame.gameName) {
      return HttpResponse.json(mockGame, { status: 200 });
    }

    return HttpResponse.json(mockGameServerError, { status: 401 });
  }),

  // mock get game details
  http.get(`${baseAddress}/api/Game/:gameId`, async ({ params }) => {
    const { gameId } = params;
    if (gameId === mockGame.gameId) {
      return HttpResponse.json(mockGame, { status: 200 });
    } else return HttpResponse.json(mockGameServerError, { status: 404 });
  }),

  // Mock Edit Game API
  http.patch(`${baseAddress}/api/Game/:gameId`, async ({ params }) => {
    const { gameId } = params; // Extract game ID from request URL

    if (gameId === mockGame.gameId) {
      return HttpResponse.json(mockGame, { status: 200 });
    }

    return HttpResponse.json(mockGameServerError, { status: 404 });
  }),

  // Mock Delete Game API
  http.delete(`${baseAddress}/api/Game/:gameId`, async ({ params }) => {
    const { gameId } = params; // Extract game ID

    if (gameId === mockGame.gameId) {
      return HttpResponse.json({ status: 204 });
    }

    return HttpResponse.json(mockGameServerError, { status: 404 });
  }),
];
