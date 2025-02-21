import useGenerateQKey from "@/hooks/useGenerateQKey";
import { describe } from "node:test";

describe("useGenerateQKey Hook", () => {
  const generateQKey = useGenerateQKey();

  it("should return correct key for game list with no filter", () => {
    expect(generateQKey.getGameListQueryKey()).toEqual(["game-list"]);
  });

  it("should return correct key for game list with user filter", () => {
    expect(
      generateQKey.getGameListQueryKey({ createdByUserId: "123" })
    ).toEqual(["game-list", "user:123"]);
  });

  it("should return correct key for game list with game name filter", () => {
    expect(generateQKey.getGameListQueryKey({ gameName: "chess" })).toEqual([
      "game-list",
      "game:chess",
    ]);
  });

  test("should return correct key for game list with both filters", () => {
    expect(
      generateQKey.getGameListQueryKey({
        createdByUserId: "123",
        gameName: "chess",
      })
    ).toEqual(["game-list", "user:123", "game:chess"]);
  });

  it("should return correct key for game detail", () => {
    expect(generateQKey.getGameDetailQueryKey("456")).toEqual([
      "game-detail",
      "456",
    ]);
  });

  it("should return correct key for game attempt", () => {
    expect(generateQKey.getGameAttemptQKey("789")).toEqual([
      "game-attempt",
      "789",
    ]);
  });
});
