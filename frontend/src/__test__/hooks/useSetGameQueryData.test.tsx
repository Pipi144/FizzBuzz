import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import { TGameRule } from "@/models/gameRule";
import { jest } from "@jest/globals";
import useGetGame from "@/hooks/useGetGame";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import useGetGameDetail from "@/hooks/useGetGameDetail";
import { mockGame } from "@/__mocks__/gameHandlers";
import useGenerateQKey from "@/hooks/useGenerateQKey";

// ✅ Create a test QueryClient with spies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});
jest.spyOn(queryClient, "setQueryData");
jest.spyOn(queryClient, "removeQueries");

const wrapper = createReactQueryWrapper(queryClient);

// Mock Data
const mockGameRule: TGameRule = {
  ruleId: "rule_1",
  gameId: mockGame.gameId,
  replacedWord: "Test Rule",
  divisibleNumber: 3,
};

describe("useSetGameQueryData Hook", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // initialize data to game list and game detail cache
    const { result: resultGetGame } = renderHook(() => useGetGame(), {
      wrapper,
    });
    const { result: resultGetGameDetail } = renderHook(
      () => useGetGameDetail({ gameId: mockGame.gameId }),
      { wrapper }
    );
    await waitFor(() => {
      expect(resultGetGame.current.isSuccess).toBe(true);

      expect(resultGetGameDetail.current.isSuccess).toBe(true);
    });
  });
  afterEach(() => {
    queryClient.clear();
  });

  it("should add a game to the cache", async () => {
    const { result: resultGenerateQKey } = renderHook(() => useGenerateQKey());
    const { result } = renderHook(() => useSetGameQueryData(), { wrapper });
    act(() => result.current.addGameQueryData(mockGame));
    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      expect.arrayContaining(resultGenerateQKey.current.getGameListQueryKey()),
      expect.any(Function)
    );
  });

  it("should edit an existing game in the cache", () => {
    const { result: resultGenerateQKey } = renderHook(() => useGenerateQKey());
    const { result } = renderHook(() => useSetGameQueryData(), { wrapper });

    act(() =>
      result.current.editGameQueryData({
        ...mockGame,
        gameName: "Updated Game",
      })
    );

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      expect.arrayContaining(resultGenerateQKey.current.getGameListQueryKey()),
      expect.any(Function)
    );
  });

  it("should delete a game from the cache", () => {
    const { result: resultGenerateQKey } = renderHook(() => useGenerateQKey());
    const { result } = renderHook(() => useSetGameQueryData(), { wrapper });

    act(() => result.current.deleteGameQueryData("game_1"));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      expect.arrayContaining(resultGenerateQKey.current.getGameListQueryKey()),
      expect.any(Function)
    );
  });

  it("should add a game rule to the cache", () => {
    const { result: resultGenerateQKey } = renderHook(() => useGenerateQKey());
    const { result } = renderHook(() => useSetGameQueryData(), { wrapper });

    act(() => result.current.addGameRuleQueryData(mockGameRule));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      expect.arrayContaining(
        resultGenerateQKey.current.getGameDetailQueryKey(mockGameRule.gameId)
      ),
      expect.any(Function)
    );
  });

  it("should edit an existing game rule in the cache", () => {
    const { result: resultGenerateQKey } = renderHook(() => useGenerateQKey());
    const { result } = renderHook(() => useSetGameQueryData(), { wrapper });

    act(() =>
      result.current.editGameRuleQueryData({
        ...mockGameRule,
        replacedWord: "Updated Rule",
      })
    );

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      expect.arrayContaining(
        resultGenerateQKey.current.getGameDetailQueryKey(mockGameRule.gameId)
      ),
      expect.any(Function)
    );
  });

  it("should delete a game rule from the cache", () => {
    const { result: resultGenerateQKey } = renderHook(() => useGenerateQKey());
    const { result } = renderHook(() => useSetGameQueryData(), { wrapper });

    act(() => result.current.deleteGameRuleQueryData(mockGameRule));

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      expect.arrayContaining(
        resultGenerateQKey.current.getGameDetailQueryKey(mockGameRule.gameId)
      ),
      expect.any(Function)
    );
  });
});
