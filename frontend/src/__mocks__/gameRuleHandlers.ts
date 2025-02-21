import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";
import { TAddGameRulePayload, TGameRule } from "@/models/gameRule";
import { TServerError } from "@/models/ServerErrorRespond";

// Mock Data
export const mockGameRule: TGameRule = {
  ruleId: "85",
  gameId: "41",
  divisibleNumber: 3,
  replacedWord: "hello",
};

export const mockRuleServerError: TServerError = {
  message: "Failed",
  statusCode: 500,
  detailed: "Internal Server Error",
  type: "Server Error",
};

// **Game Rule Handlers**
export const gameRuleHandlers = [
  // Mock Edit Game Rule API
  http.patch(`${baseAddress}/api/GameRule/:ruleId`, async ({ params }) => {
    const { ruleId } = params; // Extract rule ID from request URL

    if (ruleId === mockGameRule.ruleId) {
      return HttpResponse.json(mockGameRule, { status: 200 });
    }

    return HttpResponse.json(mockRuleServerError, { status: 404 });
  }),

  // Mock Add Game Rule API
  http.post(`${baseAddress}/api/GameRule`, async ({ request }) => {
    const payload = (await request.json()) as TAddGameRulePayload;

    if (payload.gameId === mockGameRule.gameId) {
      return HttpResponse.json(
        { ...mockGameRule, ...payload },
        { status: 201 }
      );
    }

    return HttpResponse.json(mockRuleServerError, { status: 400 });
  }),

  // Mock Delete Game Rule API
  http.delete(`${baseAddress}/api/GameRule/:ruleId`, async ({ params }) => {
    const { ruleId } = params; // Extract rule ID

    if (ruleId === mockGameRule.ruleId) {
      return HttpResponse.json({ status: 204 });
    }

    return HttpResponse.json(mockRuleServerError, { status: 404 });
  }),
];
