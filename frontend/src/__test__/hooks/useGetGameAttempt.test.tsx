import {
  mockAttemptServerError,
  mockGameAttempt,
} from "@/__mocks__/gameAttemptHandlers";
import useGetGameAttempt from "@/hooks/useGetGameAttempt";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});
const wrapper = createReactQueryWrapper(queryClient);
describe("useGetGameAttempt hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it("should return game attempt when successful", async () => {
    const { result } = renderHook(
      () => useGetGameAttempt({ attemptId: mockGameAttempt.attemptId }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(mockGameAttempt);
  });

  it("should call onErrorGetGameAttempt when failed", async () => {
    const onErrorGetGameAttempt = jest.fn();

    const { result } = renderHook(
      () =>
        useGetGameAttempt({
          attemptId: "failed",
          onErrorGetGameAttempt,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toEqual(mockAttemptServerError);
    expect(onErrorGetGameAttempt).toHaveBeenCalledWith(mockAttemptServerError);
  });
});
