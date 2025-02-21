import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import useMutateGameRule from "@/hooks/useMutateGameRule";
import { TAddGameRulePayload, TUpdateGameRulePayload } from "@/models/gameRule";

import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import {
  mockGameRule,
  mockRuleServerError,
} from "@/__mocks__/gameRuleHandlers";

//  Helper function to provide QueryClient
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = createReactQueryWrapper(queryClient);

//  Mock Data
const mockAddPayload: TAddGameRulePayload = {
  gameId: "1",
  divisibleNumber: 3,
  replacedWord: "hello",
};
const mockUpdatePayload: TUpdateGameRulePayload = {
  ruleId: "10000",
  divisibleNumber: 3,
  replacedWord: "hello",
};
describe("useMutateGameRule Hook", () => {
  beforeEach(() => {
    jest.resetAllMocks(); //  Reset mocks before each test
    queryClient.clear(); //  Clear cache before each test
  });

  it("should call onSuccessAddGameRule when createGameRule succeeds", async () => {
    // to success trigger add api, gameId in payload should be same as mockGameRule.gameId
    const onSuccessAddGameRule = jest.fn();
    const { result } = renderHook(
      () => useMutateGameRule({ onSuccessAddGameRule }),
      { wrapper }
    );

    act(() => {
      result.current.createGameRule.mutate({
        ...mockAddPayload,
        gameId: mockGameRule.gameId,
      });
    });

    await waitFor(() =>
      expect(result.current.createGameRule.isSuccess).toBe(true)
    );
    expect(result.current.createGameRule.data).toEqual(mockGameRule);
    expect(onSuccessAddGameRule).toHaveBeenCalledWith(mockGameRule);
  });

  it("should call onErrorAddGameRule when createGameRule fails", async () => {
    const onErrorAddGameRule = jest.fn();
    const { result } = renderHook(
      () => useMutateGameRule({ onErrorAddGameRule }),
      { wrapper }
    );

    act(() => {
      result.current.createGameRule.mutate(mockAddPayload);
    });

    await waitFor(() =>
      expect(result.current.createGameRule.isError).toBe(true)
    );
    expect(result.current.createGameRule.error).toEqual(mockRuleServerError);
    expect(onErrorAddGameRule).toHaveBeenCalledWith(mockRuleServerError);
  });

  it("should call onSuccessEditGameRule when editGameRule succeeds", async () => {
    //to success trigger edit api, ruleId in payload should be same as mockGameRule.ruleId

    const onSuccessEditGameRule = jest.fn();
    const { result } = renderHook(
      () => useMutateGameRule({ onSuccessEditGameRule }),
      { wrapper }
    );

    act(() => {
      result.current.editGameRule.mutate({
        ...mockUpdatePayload,
        ruleId: mockGameRule.ruleId,
      });
    });

    await waitFor(() =>
      expect(result.current.editGameRule.isSuccess).toBe(true)
    );
    expect(result.current.editGameRule.data).toEqual(mockGameRule);
    expect(onSuccessEditGameRule).toHaveBeenCalledWith(mockGameRule);
  });

  it("should call onErrorEditGameRule when editGameRule fails", async () => {
    const onErrorEditGameRule = jest.fn();
    const { result } = renderHook(
      () => useMutateGameRule({ onErrorEditGameRule }),
      { wrapper }
    );

    act(() => {
      result.current.editGameRule.mutate(mockUpdatePayload);
    });

    await waitFor(() => expect(result.current.editGameRule.isError).toBe(true));

    expect(result.current.editGameRule.error).toEqual(mockRuleServerError);
    expect(onErrorEditGameRule).toHaveBeenCalledWith(mockRuleServerError);
  });

  it("should call onSuccessDeleteGameRule when deleteGameRule succeeds", async () => {
    // to success trigger delete api, ruleId in payload should be same as mockGameRule.ruleId

    const onSuccessDeleteGameRule = jest.fn();
    const { result } = renderHook(
      () => useMutateGameRule({ onSuccessDeleteGameRule }),
      { wrapper }
    );

    act(() => {
      result.current.deleteGameRule.mutate(mockGameRule.ruleId);
    });

    await waitFor(() =>
      expect(result.current.deleteGameRule.isSuccess).toBe(true)
    );

    expect(onSuccessDeleteGameRule).toHaveBeenCalledWith(mockGameRule.ruleId);
  });

  it("should call onErrorDeleteGameRule when deleteGameRule fails", async () => {
    const onErrorDeleteGameRule = jest.fn();
    const deletedRuleId = "failedId";
    const { result } = renderHook(
      () => useMutateGameRule({ onErrorDeleteGameRule }),
      { wrapper }
    );

    act(() => {
      result.current.deleteGameRule.mutate(deletedRuleId);
    });

    await waitFor(() =>
      expect(result.current.deleteGameRule.isError).toBe(true)
    );

    expect(result.current.deleteGameRule.error).toEqual(mockRuleServerError);
    expect(onErrorDeleteGameRule).toHaveBeenCalledWith(mockRuleServerError);
  });
});
