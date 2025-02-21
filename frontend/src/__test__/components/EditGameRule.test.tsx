import { mockGame } from "@/__mocks__/gameHandlers";
import { server } from "@/__mocks__/server";
import { baseAddress } from "@/baseAddress";
import EditGameRule from "@/components/EditGameRule/EditGameRule";
import { toast } from "@/hooks/use-toast";
import useGetGameDetail from "@/hooks/useGetGameDetail";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import { TGameRule } from "@/models/gameRule";
import GameProvider from "@/Providers/GameProvider";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";

import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";

// mock modules
jest.mock("@/components/ui/spinner", () => {
  const MockSpinner = () => <div data-testid="loader">Creating game...</div>;
  MockSpinner.displayName = "MockSpinner";
  return MockSpinner;
});

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));
jest.mock("@/hooks/useSetGameQueryData");

// mock data
const mockAddGameRuleQueryData = jest.fn();

// queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
const renderEditGameRule = () =>
  render(
    <GameProvider>
      <EditGameRule game={mockGame} />
    </GameProvider>,
    { wrapper: createReactQueryWrapper(queryClient) }
  );

const getInteractiveElements = () => ({
  newNumberInput: screen.getByTestId("edit-rule-add-divisible-number"),
  newReplaceWordInput: screen.getByTestId("edit-rule-add-replace-word"),
  addRuleBtn: screen.getByRole("button", { name: /add rule/i }),
});

const getRuleItem = (divisibleNumber: number) =>
  screen.getByTestId(`rule-item-${divisibleNumber}`);

const addNewRule = (newNumber: string, newReplaceWord: string) => {
  const { newNumberInput, newReplaceWordInput, addRuleBtn } =
    getInteractiveElements();
  fireEvent.change(newNumberInput, {
    target: {
      value: newNumber,
    },
  });
  fireEvent.change(newReplaceWordInput, {
    target: {
      value: newReplaceWord,
    },
  });
  fireEvent.click(addRuleBtn);
};

// ** Test **
describe("EditGameRule component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    server.resetHandlers();

    // mock useSetGameQueryData
    (useSetGameQueryData as jest.Mock).mockReturnValue({
      addGameRuleQueryData: mockAddGameRuleQueryData,
    });
  });

  it("should render EditGameRule correctly", () => {
    renderEditGameRule();
    const { newNumberInput, newReplaceWordInput, addRuleBtn } =
      getInteractiveElements();
    expect(newNumberInput).toBeInTheDocument();
    expect(newReplaceWordInput).toBeInTheDocument();
    expect(addRuleBtn).toBeInTheDocument();

    // rule item should be rendered
    const ruleItem = getRuleItem(mockGame.gameRules[0].divisibleNumber);
    expect(ruleItem).toBeInTheDocument();
  });

  it("add new rule with empty fields => show toast error", () => {
    renderEditGameRule();
    const { addRuleBtn } = getInteractiveElements();
    fireEvent.click(addRuleBtn);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Fields are required",
        description: "Please fill in all fields",
      })
    );
  });

  it("add new rule with duplicate divisible number => show toast error", () => {
    renderEditGameRule();
    addNewRule(mockGame.gameRules[0].divisibleNumber.toString(), "hello");

    // toast should be called
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Rule already exists",
        description: "Rule with this divisible number already exists",
      })
    );
  });

  it("add new rule success => add new rule to query data and reset fields", async () => {
    const mockNewRule: TGameRule = {
      gameId: "1",
      divisibleNumber: 10,
      replacedWord: "hello",
      ruleId: "2",
    };
    // mock add new rule api
    server.use(
      http.post(`${baseAddress}/api/GameRule`, async ({}) => {
        return HttpResponse.json(mockNewRule, { status: 201 });
      })
    );
    // mock game details api
    server.use(
      http.get(`${baseAddress}/api/Game/${mockGame.gameId}`, async () => {
        return HttpResponse.json(mockGame, { status: 200 });
      })
    );
    renderEditGameRule();
    // seeding data into game details in react query
    renderHook(() => useGetGameDetail({ gameId: mockGame.gameId }), {
      wrapper: createReactQueryWrapper(queryClient),
    });

    const { newNumberInput, newReplaceWordInput } = getInteractiveElements();
    addNewRule("10", "hello");

    // add new rule to query data should be called
    await waitFor(() => {
      expect(mockAddGameRuleQueryData).toHaveBeenCalledWith(
        expect.objectContaining(mockNewRule)
      );
    });

    // fields should be reset
    expect(newNumberInput).toHaveValue(null);
    expect(newReplaceWordInput).toHaveValue("");
  });

  it("add new rule failed => show toast error and keep fields' value", async () => {
    // mock add new rule api
    server.use(
      http.post(`${baseAddress}/api/GameRule`, async () => {
        return HttpResponse.json({ message: "Failed" }, { status: 400 });
      })
    );
    renderEditGameRule();
    const { newNumberInput, newReplaceWordInput } = getInteractiveElements();
    addNewRule("10", "hello");

    // toast should be called
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Add failed",
          description: "Failed",
        })
      );
    });

    // fields should not be reset
    expect(newNumberInput).toHaveValue(10);
    expect(newReplaceWordInput).toHaveValue("hello");
  });
});
