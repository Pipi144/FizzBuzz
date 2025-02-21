import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import useMutateGame from "@/hooks/useMutateGame";
import { TAddGamePayload, TUpdateGamePayload } from "@/models/game";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { mockGame, mockGameServerError } from "@/__mocks__/gameHandlers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});
const wrapper = createReactQueryWrapper(queryClient);

const mockAddPayload: TAddGamePayload = {
  gameName: "peter test 1",
  timeLimit: 20,
  numberRange: 20,
  createdByUserId: "6",
  gameRules: [],
};

const mockEditPayload: TUpdateGamePayload = {
  gameId: "41",
  gameName: "pipi",
  timeLimit: 20,
  numberRange: 40,
};

describe("useMutateGame Hook", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    queryClient.clear();
  });

  it("should call onSuccessAddGame when createGame succeeds", async () => {
    // to trigger add success, the game name of add payload should match mockGame.gameName

    const onSuccessAddGame = jest.fn();
    const { result } = renderHook(() => useMutateGame({ onSuccessAddGame }), {
      wrapper,
    });

    act(() => {
      result.current.createGame.mutate({
        ...mockAddPayload,
        gameName: mockGame.gameName,
      });
    });

    await waitFor(() => expect(result.current.createGame.isSuccess).toBe(true));
    expect(result.current.createGame.data).toEqual(mockGame);
    expect(onSuccessAddGame).toHaveBeenCalledWith(mockGame);
  });

  it("should call onErrorAddGame when createGame fails", async () => {
    const onErrorAddGame = jest.fn();
    const { result } = renderHook(() => useMutateGame({ onErrorAddGame }), {
      wrapper,
    });

    act(() => {
      result.current.createGame.mutate(mockAddPayload);
    });

    await waitFor(() => expect(result.current.createGame.isError).toBe(true));
    expect(result.current.createGame.error).toEqual(mockGameServerError);
    expect(onErrorAddGame).toHaveBeenCalledWith(mockGameServerError);
  });

  it("should call onSuccessEditGame when editGame succeeds", async () => {
    // to success the edit, the gameId of edit payload should match mockGame.gameId
    const onSuccessEditGame = jest.fn();
    const { result } = renderHook(() => useMutateGame({ onSuccessEditGame }), {
      wrapper,
    });

    act(() => {
      result.current.editGame.mutate({
        ...mockEditPayload,
        gameId: mockGame.gameId,
      });
    });

    await waitFor(() => expect(result.current.editGame.isSuccess).toBe(true));
    expect(result.current.editGame.data).toEqual(mockGame);
    expect(onSuccessEditGame).toHaveBeenCalledWith(mockGame);
  });

  it("should call onErrorEditGame when editGame fails", async () => {
    const onErrorEditGame = jest.fn();
    const { result } = renderHook(() => useMutateGame({ onErrorEditGame }), {
      wrapper,
    });

    act(() => {
      result.current.editGame.mutate(mockEditPayload);
    });

    await waitFor(() => expect(result.current.editGame.isError).toBe(true));
    expect(result.current.editGame.error).toEqual(mockGameServerError);
    expect(onErrorEditGame).toHaveBeenCalledWith(mockGameServerError);
  });

  it("should call onSuccessDeleteGame when deleteGame succeeds", async () => {
    const onSuccessDeleteGame = jest.fn();
    const { result } = renderHook(
      () => useMutateGame({ onSuccessDeleteGame }),
      { wrapper }
    );

    act(() => {
      result.current.deleteGame.mutate(mockGame.gameId);
    });

    await waitFor(() => expect(result.current.deleteGame.isSuccess).toBe(true));

    expect(onSuccessDeleteGame).toHaveBeenCalledWith(mockGame.gameId);
  });

  it("should call onErrorDeleteGame when deleteGame fails", async () => {
    const onErrorDeleteGame = jest.fn();
    const { result } = renderHook(() => useMutateGame({ onErrorDeleteGame }), {
      wrapper,
    });

    act(() => {
      result.current.deleteGame.mutate("wrong id");
    });

    await waitFor(() => expect(result.current.deleteGame.isError).toBe(true));
    expect(result.current.deleteGame.error).toEqual(mockGameServerError);
    expect(onErrorDeleteGame).toHaveBeenCalledWith(mockGameServerError);
  });
});
