import { server } from "@/__mocks__/server";
import PlayGame from "@/app/game/[gameId]/play/page";
import { baseAddress } from "@/baseAddress";
import { toast } from "@/hooks/use-toast";
import { TGame } from "@/models/game";
import { TGameAttempt } from "@/models/gameAttempt";
import { TGameQuestion } from "@/models/gameQuestion";
import { TUser } from "@/models/user";
import { useAuthStore } from "@/stores/authStore";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { QueryClient } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useParams, useRouter } from "next/navigation";

// mock modules
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));
jest.mock("@/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));
// mock data
const mockUser: TUser = {
  userId: "user_123",
  username: "user123",
};
const mockGameAttempt: TGameAttempt = {
  attemptId: "1",
  gameId: "1",
  attemptByUserId: "user_123",
  score: 0,
  attemptByUser: mockUser,
  attemptedDate: new Date().toISOString(),
  gameQuestions: [],
};
const mockGame: TGame = {
  gameId: "1",
  gameName: "Game 1",
  timeLimit: 5,
  numberRange: 100,
  createdAt: new Date().toISOString(),
  createdByUserId: "1",
  gameRules: [
    { divisibleNumber: 3, replacedWord: "Fizz", ruleId: "1", gameId: "1" },
  ],
  user: mockUser,
};
const mockCheckGameQuestion: TGameQuestion = {
  id: "q2",
  gameAttemptId: "1",
  questionNumber: 100,
  userAnswer: "",
  isCorrectAnswer: false,
};
const mockGenerateGameQuestion: TGameQuestion = {
  id: "q1",
  gameAttemptId: "1",
  questionNumber: 10,
  userAnswer: "",
  isCorrectAnswer: false,
};
const mockRouterPush = jest.fn();
const mockRouterRepalce = jest.fn();
//helper functions
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const getGameDetailsLoader = () => screen.getByTestId("game-details-loader");

const getInteractiveElements = () => ({
  questionNumberDisplay: screen.getByTestId("question-number"),
  answerInput: screen.getByPlaceholderText("Enter your answer..."),
  nextButton: screen.getByRole("button", { name: /next/i }),
});

const checkContentFullyLoaded = async () => {
  await waitFor(() => {
    // game details loaded => display title and game rules
    expect(screen.getByText("Play game")).toBeInTheDocument();

    expect(screen.getByText("Play game")).toBeInTheDocument();
    expect(screen.getByText(/Fizz/i)).toBeInTheDocument(); // Game rule
  });

  // continue create a game attempt and generate question
  await waitFor(() => {
    // question generated=> display number and answer input
    expect(screen.getByText("10")).toBeInTheDocument(); // Question number
    expect(
      screen.getByPlaceholderText("Enter your answer...")
    ).toBeInTheDocument(); // GameAnswer input
  });
};
const renderPlayGamePage = () =>
  render(<PlayGame />, {
    wrapper: createReactQueryWrapper(queryClient),
  });
describe("Game play page integration test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    (useParams as jest.Mock).mockReturnValue({ gameId: mockGame.gameId });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterRepalce,
    });
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      currentUser: mockUser,
    });
    // Mock get game detail API
    server.use(
      http.get(`${baseAddress}/api/game/${mockGame.gameId}`, () =>
        HttpResponse.json(mockGame, { status: 200 })
      ),
      // Mock Create Game Attempt API
      http.post(`${baseAddress}/api/game-attempt`, async ({}) => {
        return HttpResponse.json(mockGameAttempt, { status: 201 });
      }),
      // Mock check question API
      http.post(`${baseAddress}/api/game-attempt/check`, () =>
        HttpResponse.json(mockCheckGameQuestion, { status: 200 })
      ),
      // Mock generate question API
      http.get(
        `${baseAddress}/api/game-attempt/generate-question/${mockGameAttempt.attemptId}`,
        async () => {
          return HttpResponse.json(mockGenerateGameQuestion, { status: 200 });
        }
      )
    );
  });

  it("renders loader while fetching game details", async () => {
    renderPlayGamePage();
    expect(getGameDetailsLoader()).toBeInTheDocument();
    await waitForElementToBeRemoved(() => expect(getGameDetailsLoader()));
  });

  it("handles error when fetching game details fails", async () => {
    server.use(
      http.get(`${baseAddress}/api/Game/${mockGame.gameId}`, () =>
        HttpResponse.json({ message: "Game not found" }, { status: 404 })
      )
    );

    renderPlayGamePage();
    await waitFor(() =>
      expect(toast).toHaveBeenLastCalledWith(
        expect.objectContaining({
          title: "Failed to get game details",
          description: "Game not found",
        })
      )
    );

    expect(screen.getByText("Game not found")).toBeInTheDocument();
  });

  it("renders game details with timer and answer components", async () => {
    renderPlayGamePage();

    await checkContentFullyLoaded();
  });

  it("counts down and navigates to result page on timer end", async () => {
    jest.useFakeTimers();
    renderPlayGamePage();

    await checkContentFullyLoaded();

    act(() => {
      jest.advanceTimersByTime(5000); // Simulate 5 seconds countdown because mock game time limit is 5
    });

    await waitFor(() => {
      expect(mockRouterRepalce).toHaveBeenCalledWith(
        `/game/${mockGame.gameId}/${mockGameAttempt.attemptId}`
      );
    });
  });

  it("submits answer and resets timer with new question", async () => {
    jest.useFakeTimers();
    renderPlayGamePage();

    await checkContentFullyLoaded();

    const { answerInput, nextButton, questionNumberDisplay } =
      getInteractiveElements();
    act(() => {
      fireEvent.change(answerInput, { target: { value: "Fizz" } });
      fireEvent.click(nextButton);
    });

    await waitFor(() =>
      expect(questionNumberDisplay).toHaveTextContent(
        mockCheckGameQuestion.questionNumber.toString()
      )
    ); // New question number

    // Timer should reset
    expect(screen.getByText(/00:05/)).toBeInTheDocument();
  });
});
