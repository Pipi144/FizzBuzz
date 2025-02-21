import { server } from "@/__mocks__/server";
import { baseAddress } from "@/baseAddress";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useParams, useRouter } from "next/navigation";
import AppRoutes from "@/RoutePaths";
import GameResult from "@/app/game/[gameId]/[attemptId]/page";
import { TGameAttempt } from "@/models/gameAttempt";
import { toast } from "@/hooks/use-toast";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));
// mock data
export const mockGameAttempt: TGameAttempt = {
  attemptId: "1",
  gameId: "game_123",
  attemptByUserId: "user_123",
  score: 0,
  attemptByUser: {
    userId: "user_123",
    username: "user123",
  },
  attemptedDate: new Date().toISOString(),
  gameQuestions: [
    {
      id: "q1",
      gameAttemptId: "1",
      questionNumber: 100,
      userAnswer: "hello",
      isCorrectAnswer: false,
    },
    {
      id: "q2",
      gameAttemptId: "1",
      questionNumber: 144,
      userAnswer: "144",
      isCorrectAnswer: true,
    },
  ],
};
// **Test Setup**
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const mockRouterPush = jest.fn();
const mockUseRouter = useRouter as jest.Mock;
const mockUseParams = useParams as jest.Mock;

// Function to render the component with a QueryClient wrapper
const renderGameResultPage = () =>
  render(<GameResult />, {
    wrapper: createReactQueryWrapper(queryClient),
  });

const getResultLoader = () => screen.getByTestId("get-attempt-loader");

const getContentElements = () => ({
  correctAnswer: screen.getByTestId(
    `total-correct-${mockGameAttempt.attemptId}`
  ),
  incorrectAnswer: screen.getByTestId(
    `total-incorrect-${mockGameAttempt.attemptId}`
  ),
  totalScore: screen.getByTestId(`total-score-${mockGameAttempt.attemptId}`),
  totalQuestions: screen.getByTestId(
    `total-question-${mockGameAttempt.attemptId}`
  ),
});
// **Tests**
describe("GameResult Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    server.resetHandlers();
    mockUseParams.mockReturnValue({
      gameId: mockGameAttempt.gameId,
      attemptId: mockGameAttempt.attemptId,
    });
    mockUseRouter.mockReturnValue({ push: mockRouterPush });

    // **Mock API Handler**
    server.use(
      http.get(
        `${baseAddress}/api/game-attempt/${mockGameAttempt.attemptId}`,
        async () => {
          return HttpResponse.json(mockGameAttempt, { status: 200 });
        }
      )
    );
  });

  it("renders correctly with fetched game result data", async () => {
    renderGameResultPage();

    // wait for loading to disappear
    await waitForElementToBeRemoved(() => expect(getResultLoader()));

    expect(screen.getByText("Game result")).toBeInTheDocument();
    expect(screen.getByText("Total questions:")).toBeInTheDocument();
    expect(screen.getByText("Correct answers:")).toBeInTheDocument();
    expect(screen.getByText("Incorrect answers:")).toBeInTheDocument();
    expect(screen.getByText("Final score:")).toBeInTheDocument();

    // the assertion for gameQuestions count
    const { correctAnswer, incorrectAnswer, totalScore, totalQuestions } =
      getContentElements();
    expect(totalQuestions).toHaveTextContent(
      mockGameAttempt.gameQuestions.length.toString()
    );
    expect(correctAnswer).toHaveTextContent(
      mockGameAttempt.gameQuestions
        .filter((q) => q.isCorrectAnswer)
        .length.toString()
    );
    expect(incorrectAnswer).toHaveTextContent(
      mockGameAttempt.gameQuestions
        .filter((q) => !q.isCorrectAnswer)
        .length.toString()
    );
    expect(totalScore).toHaveTextContent(mockGameAttempt.score.toString());
  });

  it("shows error when API call fails", async () => {
    server.use(
      http.get(
        `${baseAddress}/api/game-attempt/${mockGameAttempt.attemptId}`,
        async () => {
          return HttpResponse.json(
            { message: "Failed to load data" },
            { status: 500 }
          );
        }
      )
    );
    renderGameResultPage();
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to get game result",
          description: "Failed to load data",
        })
      );
      expect(screen.getByText("Attempt not found")).toBeInTheDocument();
    });
  });

  it("navigates back to game list when 'Play more game' is clicked", async () => {
    renderGameResultPage();

    await waitFor(() =>
      expect(screen.getByText("Game result")).toBeInTheDocument()
    );

    const playMoreButton = screen.getByText("Play more game");
    fireEvent.click(playMoreButton);

    expect(mockRouterPush).toHaveBeenCalledWith(AppRoutes.Game);
  });
});
