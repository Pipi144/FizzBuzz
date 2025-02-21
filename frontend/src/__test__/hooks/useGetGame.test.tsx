import {
  mockGameBasicList,
  mockGameServerError,
} from "@/__mocks__/gameHandlers";

import useGetGame from "@/hooks/useGetGame";
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

  it("should fetch game list data successfully", async () => {
    // to success with msw, don't pass any get game params or pass params createdByUserId: "1"
    const { result } = renderHook(
      () =>
        useGetGame({
          filter: {
            createdByUserId: "1",
          },
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockGameBasicList);
  });

  it("should call onErrorGetGame when failed", async () => {
    const onErrorGetGame = jest.fn();
    const { result } = renderHook(
      () => useGetGame({ onErrorGetGame, filter: { createdByUserId: "100" } }),
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockGameServerError);
    });

    expect(onErrorGetGame).toHaveBeenCalledWith(mockGameServerError);
  });
});
