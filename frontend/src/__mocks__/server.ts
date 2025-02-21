import { setupServer } from "msw/node";
import { authHandlers } from "./authHandlers";
import { gameHandlers } from "./gameHandlers";
import { gameAttemptHandlers } from "./gameAttemptHandlers";
import { gameRuleHandlers } from "./gameRuleHandlers";

export const server = setupServer(
  ...authHandlers,
  ...gameHandlers,
  ...gameAttemptHandlers,
  ...gameRuleHandlers
);
