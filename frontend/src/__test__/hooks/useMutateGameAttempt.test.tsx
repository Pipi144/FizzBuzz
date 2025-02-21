import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import useMutateGameAttempt from "@/hooks/useMutateGameAttempt";
import {
  TAddGameAttemptPayload,
  TCheckAnswerPayload,
} from "@/models/gameAttempt";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import {
  mockAttemptServerError,
  mockGameAttempt,
  mockGameQuestion,
} from "@/__mocks__/gameAttemptHandlers";

// Helper function to provide QueryClient
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = createReactQueryWrapper(queryClient);

// Mock Data
const mockAddPayload: TAddGameAttemptPayload = {
  gameId: "1",
  attemptByUserId: "1",
};
const mockCheckAnswerPayload: TCheckAnswerPayload = {
  questionId: "1",
  answer: "1",
};
describe("useMutateGameAttempt Hook", () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
    queryClient.clear(); // Clear queryClient before each test
  });

  it("should call onSuccessCreateGameAttempt when createGameAttempt succeeds", async () => {
    // to trigger success add api, the add payload gameId should be equal to mockGameAttempt.gameId
    const onSuccessCreateGameAttempt = jest.fn();
    const { result } = renderHook(
      () => useMutateGameAttempt({ onSuccessCreateGameAttempt }),
      { wrapper }
    );

    act(() => {
      result.current.createGameAttempt.mutate({
        ...mockAddPayload,
        gameId: mockGameAttempt.gameId,
      });
    });

    await waitFor(() =>
      expect(result.current.createGameAttempt.isSuccess).toBe(true)
    );
    expect(result.current.createGameAttempt.data).toEqual(mockGameAttempt);
    expect(onSuccessCreateGameAttempt).toHaveBeenCalledWith(mockGameAttempt);
  });

  it("should call onErrorCreateGameAttempt when createGameAttempt fails", async () => {
    const onErrorCreateGameAttempt = jest.fn();
    const { result } = renderHook(
      () => useMutateGameAttempt({ onErrorCreateGameAttempt }),
      { wrapper }
    );

    act(() => {
      result.current.createGameAttempt.mutate(mockAddPayload);
    });

    await waitFor(() =>
      expect(result.current.createGameAttempt.isError).toBe(true)
    );
    expect(result.current.createGameAttempt.error).toEqual(
      mockAttemptServerError
    );
    expect(onErrorCreateGameAttempt).toHaveBeenCalledWith(
      mockAttemptServerError
    );
  });

  it("should call onSuccessGenerateQuestion when generateQuestion succeeds", async () => {
    // to trigger success generate api, the gameAttemptId should be equal to mockGameAttempt.attemptId
    const onSuccessGenerateQuestion = jest.fn();
    const { result } = renderHook(
      () => useMutateGameAttempt({ onSuccessGenerateQuestion }),
      { wrapper }
    );

    act(() => {
      result.current.generateQuestion.mutate(mockGameAttempt.attemptId);
    });

    await waitFor(() =>
      expect(result.current.generateQuestion.isSuccess).toBe(true)
    );
    expect(result.current.generateQuestion.data).toEqual(mockGameQuestion);
    expect(onSuccessGenerateQuestion).toHaveBeenCalledWith(mockGameQuestion);
  });

  it("should call onErrorGenerateQuestion when generateQuestion fails", async () => {
    const onErrorGenerateQuestion = jest.fn();
    const { result } = renderHook(
      () => useMutateGameAttempt({ onErrorGenerateQuestion }),
      { wrapper }
    );

    const attemptId = "failedId";
    act(() => {
      result.current.generateQuestion.mutate(attemptId);
    });

    await waitFor(() =>
      expect(result.current.generateQuestion.isError).toBe(true)
    );
    expect(result.current.generateQuestion.error).toEqual(
      mockAttemptServerError
    );
    expect(onErrorGenerateQuestion).toHaveBeenCalledWith(
      mockAttemptServerError
    );
  });

  it("should call onSuccessCheckAnswer when checkQuestion succeeds", async () => {
    // to trigger success check api, the answer should be equal to mockGameQuestion.userAnswer

    const onSuccessCheckAnswer = jest.fn();
    const { result } = renderHook(
      () => useMutateGameAttempt({ onSuccessCheckAnswer }),
      { wrapper }
    );

    act(() => {
      result.current.checkQuestion.mutate({
        ...mockCheckAnswerPayload,
        answer: mockGameQuestion.userAnswer,
      });
    });

    await waitFor(() =>
      expect(result.current.checkQuestion.isSuccess).toBe(true)
    );
    expect(result.current.checkQuestion.data).toEqual(mockGameQuestion);
    expect(onSuccessCheckAnswer).toHaveBeenCalledWith(mockGameQuestion);
  });

  it("should call onErrorCheckAnswer when checkQuestion fails", async () => {
    const onErrorCheckAnswer = jest.fn();
    const { result } = renderHook(
      () => useMutateGameAttempt({ onErrorCheckAnswer }),
      { wrapper }
    );

    act(() => {
      result.current.checkQuestion.mutate(mockCheckAnswerPayload);
    });

    await waitFor(() =>
      expect(result.current.checkQuestion.isError).toBe(true)
    );

    expect(result.current.checkQuestion.error).toEqual(mockAttemptServerError);
    expect(onErrorCheckAnswer).toHaveBeenCalledWith(mockAttemptServerError);
  });
});
