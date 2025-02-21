import { server } from "@/__mocks__/server";
import { baseAddress } from "@/baseAddress";
import { toast } from "@/hooks/use-toast";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useParams, useRouter } from "next/navigation";
import AppRoutes from "@/RoutePaths";
import EditGame from "@/app/game/[gameId]/page";
import userEvent from "@testing-library/user-event";
import { TGame } from "@/models/game";
import useGenerateQKey from "@/hooks/useGenerateQKey";
import useGetGame from "@/hooks/useGetGame";

// mock modules
jest.mock("@/components/LoaderOverlay", () => {
  const MockLoader = () => <div data-testid="mock-loader">Loader</div>;
  MockLoader.displayName = "MockLoader";
  return MockLoader;
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// **Mock Data**
const mockGame = {
  gameId: "123",
  gameName: "Test Game",
  timeLimit: 60,
  numberRange: 100,
  gameRules: [{ ruleId: "1", divisibleNumber: 3, replacedWord: "Fizz" }],
};

// **Test Setup**
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
const renderEditGamePage = () =>
  render(<EditGame />, {
    wrapper: createReactQueryWrapper(queryClient),
  });

const mockRouterPush = jest.fn();
const mockUseRouter = useRouter as jest.Mock;
const mockUseParams = useParams as jest.Mock;

// **Interactive Elements Helper**
const getInteractiveElements = () => ({
  gameNameInput: screen.getByPlaceholderText("Enter game name"),
  timeLimitInput: screen.getByPlaceholderText("Enter time limit"),
  numberRangeInput: screen.getByPlaceholderText("Enter max range"),
  submitBtn: screen.getByRole("button", { name: /submit/i }),
  cancelBtn: screen.getByRole("button", { name: /cancel/i }),
  editForm: screen.getByRole("form"),
});

const getDataLoader = () => screen.getByTestId("loading-game-details");
const fillForm = (gameName: string, timeLimit: string, numberRange: string) => {
  const { gameNameInput, timeLimitInput, numberRangeInput } =
    getInteractiveElements();

  fireEvent.change(gameNameInput, { target: { value: gameName } });
  fireEvent.change(timeLimitInput, { target: { value: timeLimit } });
  fireEvent.change(numberRangeInput, { target: { value: numberRange } });
};

const getGameListQueryData = (gameListQKey: string[]) =>
  queryClient.getQueryData<TGame>(gameListQKey);
// **Tests**
describe("EditGame Integration Test", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    queryClient.clear();
    server.resetHandlers();
    mockUseParams.mockReturnValue({ gameId: mockGame.gameId });
    mockUseRouter.mockReturnValue({ push: mockRouterPush });

    // **Mock API Handlers**
    server.use(
      http.get(`${baseAddress}/api/Game/${mockGame.gameId}`, async () => {
        return HttpResponse.json(mockGame, { status: 200 });
      }),
      http.patch(`${baseAddress}/api/Game/${mockGame.gameId}`, async ({}) => {
        return HttpResponse.json(
          { ...mockGame, gameName: "Updated Game" },
          { status: 200 }
        );
      }),
      // Mock get game list API
      http.get(`${baseAddress}/api/Game`, async () => {
        return HttpResponse.json([mockGame], { status: 200 });
      })
    );

    // seeding game list data
    renderHook(() => useGetGame(), {
      wrapper: createReactQueryWrapper(queryClient),
    });
  });

  it("renders correctly with fetched game data", async () => {
    renderEditGamePage();

    await waitFor(() => {
      const { gameNameInput, timeLimitInput, numberRangeInput, submitBtn } =
        getInteractiveElements();

      expect(gameNameInput).toHaveValue(mockGame.gameName);
      expect(timeLimitInput).toHaveValue(mockGame.timeLimit);
      expect(numberRangeInput).toHaveValue(mockGame.numberRange);
      expect(submitBtn).toBeInTheDocument();
    });
  });

  it("shows validation errors when submitting empty fields", async () => {
    renderEditGamePage();

    // wait data loading finish
    await waitForElementToBeRemoved(() => expect(getDataLoader()));
    const { submitBtn } = getInteractiveElements();
    // Clear game name to trigger validation
    fillForm("", "60", "100");
    userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/game name required/i)).toBeInTheDocument();
    });
  });

  it("submits and edited game successfully => game detail query data updated and navigate to game list", async () => {
    const { result } = renderHook(() => useGenerateQKey());
    renderEditGamePage();

    // wait data loading finish
    await waitForElementToBeRemoved(() => expect(getDataLoader()));

    const { submitBtn } = getInteractiveElements();

    fillForm("Updated Game", "60", "100");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const gameListQueryData = getGameListQueryData(
        result.current.getGameListQueryKey()
      );
      expect(gameListQueryData).toContainEqual({
        ...mockGame,
        gameName: "Updated Game",
      });
    });
    expect(mockRouterPush).toHaveBeenCalledWith(AppRoutes.Game);
  });

  it("shows toast error when API call fails", async () => {
    server.use(
      http.patch(`${baseAddress}/api/Game/${mockGame.gameId}`, async () => {
        return HttpResponse.json({ message: "Update failed" }, { status: 500 });
      })
    );

    renderEditGamePage();

    // wait data loading finish
    await waitForElementToBeRemoved(() => expect(getDataLoader()));
    const { submitBtn } = getInteractiveElements();

    fillForm("Failed update", "60", "100");
    fireEvent.click(submitBtn);

    // wait for toast to show
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Update failed",
          description: "Update failed",
        })
      );
    });
  });

  it("navigates back when cancel is clicked", async () => {
    renderEditGamePage();

    // wait data loading finish
    await waitForElementToBeRemoved(() => expect(getDataLoader()));

    const { cancelBtn } = getInteractiveElements();

    fireEvent.click(cancelBtn);

    expect(mockRouterPush).toHaveBeenCalledWith(AppRoutes.Game);
  });
});
