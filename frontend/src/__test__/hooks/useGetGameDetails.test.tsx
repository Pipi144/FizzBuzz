import { mockGame, mockGameServerError } from "@/__mocks__/gameHandlers";

import useGetGameDetail from "@/hooks/useGetGameDetail";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

// Helper function to provide QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
const wrapper = createReactQueryWrapper(queryClient);

describe("useGetGame Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it("should fetch game detail data successfully and call onSuccess", async () => {
    const onSuccessGetGameDetail = jest.fn();
    // to success with msw, pass gameId = 1, otherwise will trigger failed api
    const { result } = renderHook(
      () =>
        useGetGameDetail({
          gameId: mockGame.gameId,
          onSuccessGetGameDetail,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockGame);
    expect(onSuccessGetGameDetail).toHaveBeenCalledWith(mockGame);
  });

  it("should call onErrorGetGameDetail when failed", async () => {
    const onErrorGetGameDetail = jest.fn();
    const { result } = renderHook(
      () => useGetGameDetail({ onErrorGetGameDetail, gameId: "1000" }),
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockGameServerError);
    });

    expect(onErrorGetGameDetail).toHaveBeenCalledWith(mockGameServerError);
  });
});
