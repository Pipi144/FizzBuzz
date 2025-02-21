import useGenerateMutationKey from "@/hooks/useGenerateMutationKey";

describe("useGenerateMutationKey Hook", () => {
  const generateMutationKey = useGenerateMutationKey(); // ✅ Call it normally

  test("should return correct key for mutating game", () => {
    expect(generateMutationKey.getMutateGameKey("add")).toEqual(["game-add"]);
    expect(generateMutationKey.getMutateGameKey("update")).toEqual([
      "game-update",
    ]);
    expect(generateMutationKey.getMutateGameKey("delete")).toEqual([
      "game-delete",
    ]);
  });

  test("should return correct key for mutating game rule", () => {
    expect(generateMutationKey.getMutateGameRuleKey("add")).toEqual([
      "gameRule-add",
    ]);
    expect(generateMutationKey.getMutateGameRuleKey("update")).toEqual([
      "gameRule-update",
    ]);
    expect(generateMutationKey.getMutateGameRuleKey("delete")).toEqual([
      "gameRule-delete",
    ]);
  });

  test("should return correct key for mutating game attempt", () => {
    expect(generateMutationKey.getMutateGameAttemptKey("add")).toEqual([
      "gameAttempt",
      "add",
    ]);
    expect(generateMutationKey.getMutateGameAttemptKey("check")).toEqual([
      "gameAttempt",
      "check",
    ]);
    expect(
      generateMutationKey.getMutateGameAttemptKey("generate-question")
    ).toEqual(["gameAttempt", "generate-question"]);
  });
});
