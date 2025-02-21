import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import AddGame from "@/app/game/create/page";
import GameProvider from "@/Providers/GameProvider";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { mockGame, mockGameServerError } from "@/__mocks__/gameHandlers";
import { server } from "@/__mocks__/server";
import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";
import AppRoutes from "@/RoutePaths";

// mock modules
jest.mock("@/components/LoaderOverlay", () => {
  const MockLoader = () => <div data-testid="loader">Creating game...</div>;
  MockLoader.displayName = "MockLoader";
  return MockLoader;
});
jest.mock("framer-motion", () => ({
  ...jest.requireActual("framer-motion"),
  domAnimation: jest.fn(),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockUseRouter = useRouter as jest.Mock;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderCreateGamePage = () =>
  render(
    <GameProvider>
      <AddGame />
    </GameProvider>,
    {
      wrapper: createReactQueryWrapper(queryClient),
    }
  );

const getInteractiveElements = () => ({
  gameNameInput: screen.getByPlaceholderText("Enter game name"),
  timeLimitInput: screen.getByPlaceholderText("Enter time limit"),
  numberRangeInput: screen.getByPlaceholderText("Enter max range"),
  submitBtn: screen.getByRole("button", { name: /submit/i }),
  cancelBtn: screen.getByRole("button", { name: /cancel/i }),
  ruleNumberInput: screen.getByPlaceholderText("Enter divisible number"),
  ruleWordInput: screen.getByPlaceholderText("Enter replaced word"),
  addRuleBtn: screen.getByRole("button", { name: /add rule/i }),
});

const addRule = (number: string, word: string) => {
  const { ruleNumberInput, ruleWordInput, addRuleBtn } =
    getInteractiveElements();

  fireEvent.change(ruleNumberInput, {
    target: { value: number },
  });
  fireEvent.change(ruleWordInput, {
    target: { value: word },
  });

  fireEvent.click(addRuleBtn);
};

const getRuleItemElements = (ruleNumber: string) => {
  return {
    ruleItemContainer: screen.getByTestId(`game-rule-${ruleNumber}`),
    ruleRemoveBtn: screen.getByTestId(`remove-rule-${ruleNumber}`),
  };
};

const addGameInfo = (
  gameName: string,
  timeLimit: string,
  numberRange: string
) => {
  const { gameNameInput, timeLimitInput, numberRangeInput } =
    getInteractiveElements();

  fireEvent.change(gameNameInput, {
    target: { value: gameName },
  });
  fireEvent.change(timeLimitInput, {
    target: { value: timeLimit },
  });
  fireEvent.change(numberRangeInput, {
    target: { value: numberRange },
  });
};
describe("Create Game page Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
    });
    server.resetHandlers();
  });

  it("renders the form and inputs correctly", () => {
    renderCreateGamePage();
    const {
      gameNameInput,
      timeLimitInput,
      numberRangeInput,
      submitBtn,
      cancelBtn,
    } = getInteractiveElements();
    expect(gameNameInput).toBeInTheDocument();
    expect(timeLimitInput).toBeInTheDocument();
    expect(numberRangeInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty fields", async () => {
    renderCreateGamePage();
    const { submitBtn } = getInteractiveElements();
    addGameInfo("", "", ""); // Empty game name, time limit and number range due to default values

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/game name required/i)).toBeInTheDocument();
      expect(screen.getByText(/minimum input is 10/i)).toBeInTheDocument();
      expect(
        screen.getByText(/number range must be positive/i)
      ).toBeInTheDocument();
    });
  });

  it("prevents submission if no game rules are added", async () => {
    renderCreateGamePage();
    const { submitBtn } = getInteractiveElements();
    addGameInfo("Test Game", "15", "100");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Rule required",
          description: "Please add at least one rule",
        })
      );
    });
  });

  it("adds and removes a game rule", async () => {
    renderCreateGamePage();

    // Add a rule
    addRule("3", "Fizz");

    const { ruleItemContainer, ruleRemoveBtn } = getRuleItemElements("3");

    // rule added successfully
    await waitFor(() => {
      expect(ruleItemContainer).toBeInTheDocument();
      expect(ruleRemoveBtn).toBeInTheDocument();
    });

    // Remove the rule
    fireEvent.click(ruleRemoveBtn);

    // rule removed successfully
    await waitFor(() => {
      expect(ruleItemContainer).not.toBeInTheDocument();
    });
  });

  it("submits a valid game and redirects", async () => {
    server.use(
      http.post(`${baseAddress}/api/Game`, async () => {
        return HttpResponse.json(mockGame, { status: 200 });
      })
    );

    renderCreateGamePage();
    addGameInfo(
      mockGame.gameName,
      mockGame.timeLimit.toString(),
      mockGame.numberRange.toString()
    );
    addRule("3", "Fizz");
    addRule("5", "Buzz");

    // rules added successfully
    await waitFor(() => {
      const { ruleItemContainer: rule1 } = getRuleItemElements("3");
      const { ruleItemContainer: rule2 } = getRuleItemElements("5");
      expect(rule1).toBeInTheDocument();
      expect(rule2).toBeInTheDocument();
    });
    const { submitBtn, gameNameInput, timeLimitInput } =
      getInteractiveElements();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith(AppRoutes.Game);
      expect(gameNameInput).toHaveValue("");
      expect(timeLimitInput).toHaveValue(60); // reset to default value
    });
  });

  it("displays error toast if API call fails", async () => {
    server.use(
      http.post(`${baseAddress}/api/Game`, async () => {
        return HttpResponse.json(mockGameServerError, { status: 401 });
      })
    );
    renderCreateGamePage();

    // fill in game info to add
    addGameInfo("Test Game", "15", "100");
    addRule("3", "Fizz");

    const { submitBtn } = getInteractiveElements();
    fireEvent.click(submitBtn);

    // api add failed, toast error displayed
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: mockGameServerError.message,
        })
      );
    });
  });

  it("navigates back when cancel is clicked", () => {
    renderCreateGamePage();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockRouterPush).toHaveBeenCalledWith("/game");
  });
});
