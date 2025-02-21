import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import GameAnswer from "@/components/GameAnswer/GameAnswer";
import { useGamePlayContext } from "@/Providers/GamePlayProvider";

import { toast } from "@/hooks/use-toast";
import { TGameQuestion } from "@/models/gameQuestion";
import { TGame } from "@/models/game";
import { createReactQueryWrapper } from "@/test_utils/testWrappers";
import { server } from "@/__mocks__/server";
import { http, HttpResponse } from "msw";
import { baseAddress } from "@/baseAddress";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";

// Mock necessary modules
jest.mock("@/Providers/GamePlayProvider", () => ({
  useGamePlayContext: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

jest.mock("@/components/LoaderOverlay", () => {
  const MockOverlay = () => <div data-testid="loader-overlay">Loading...</div>;
  return MockOverlay;
});

// mock data
export const mockServerGameQuestion: TGameQuestion = {
  id: "q1",
  gameAttemptId: "1",
  questionNumber: 100,
  userAnswer: "",
  isCorrectAnswer: false,
};
export const mockCurrentQuestion: TGameQuestion = {
  id: "q2",
  gameAttemptId: "1",
  questionNumber: 11,
  userAnswer: "",
  isCorrectAnswer: false,
};
const mockGame: TGame = {
  gameId: "1",
  gameName: "Game 1",
  timeLimit: 10,
  numberRange: 100,
  createdAt: new Date().toISOString(),
  createdByUserId: "1",
  gameRules: [
    { divisibleNumber: 3, replacedWord: "FizzBuzz", ruleId: "1", gameId: "1" },
    { divisibleNumber: 11, replacedWord: "BuzzFizz", ruleId: "2", gameId: "1" },
  ],
  user: {
    userId: "1",
    username: "user1",
  },
};
const mockSetCurrentQuestion = jest.fn();
// helper function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderGameAnswer = () =>
  render(<GameAnswer />, {
    wrapper: createReactQueryWrapper(queryClient),
  });

const getInteractiveElements = () => ({
  questionNumberDisplay: screen.getByTestId("question-number"),
  answerInput: screen.getByPlaceholderText("Enter your answer..."),
  nextButton: screen.getByRole("button", { name: /next/i }),
});

const fillAnswer = (answer: string) => {
  const { answerInput } = getInteractiveElements();
  act(() => {
    fireEvent.change(answerInput, { target: { value: answer } });
  });
};
const submitAnswer = (answer: string) => {
  const { nextButton } = getInteractiveElements();
  fillAnswer(answer);
  act(() => {
    fireEvent.click(nextButton);
  });
};

const checkNewQuestionBehavior = async () => {
  await waitFor(() => {
    // success api call => update new question on screen
    expect(mockSetCurrentQuestion).toHaveBeenCalledWith(
      expect.objectContaining(mockServerGameQuestion)
    );
  });
};
// ** Test **
describe("GameAnswer Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    server.resetHandlers();
    (useGamePlayContext as jest.Mock).mockReturnValue({
      currentQuestion: mockCurrentQuestion,
      setCurrentQuestion: mockSetCurrentQuestion,
      game: mockGame,
    });

    // mock check question api call
    server.use(
      http.post(`${baseAddress}/api/game-attempt/check`, async ({}) => {
        return HttpResponse.json(mockServerGameQuestion, { status: 200 });
      })
    );
  });

  it("renders rules and question correctly", () => {
    renderGameAnswer();

    const { questionNumberDisplay, answerInput, nextButton } =
      getInteractiveElements();
    // Check if rules are displayed
    expect(screen.getByText("Rules")).toBeInTheDocument();
    expect(screen.getByText(/FizzBuzz/)).toBeInTheDocument();
    expect(screen.getByText(/BuzzFizz/)).toBeInTheDocument();

    // Check if question is displayed
    expect(questionNumberDisplay).toHaveTextContent(
      mockCurrentQuestion.questionNumber.toString()
    );
    expect(answerInput).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it("updates input value on change", async () => {
    renderGameAnswer();

    await act(async () => {
      fillAnswer("Fizz");
    });

    expect(mockSetCurrentQuestion).toHaveBeenCalled();
  });

  it("submits answer when button is clicked =>success api and return a new question on screen", async () => {
    renderGameAnswer();

    await act(async () => {
      submitAnswer("Fizz");
    });

    await checkNewQuestionBehavior();
  });

  it("submits answer when 'Enter' is pressed =>success api and return a new question on screen", async () => {
    renderGameAnswer();

    const { answerInput } = getInteractiveElements();

    // focus input first
    await act(async () => {
      userEvent.click(answerInput);
      userEvent.type(answerInput, "Fizz{enter}");
    });

    await checkNewQuestionBehavior();
  });

  it("displays error toast on API failure", async () => {
    // mock check question api call failed
    server.use(
      http.post(`${baseAddress}/api/game-attempt/check`, async ({}) => {
        return HttpResponse.json({ message: "Check failed" }, { status: 500 });
      })
    );
    renderGameAnswer();

    await act(async () => {
      submitAnswer("Fizz");
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Something went wrong",
          description: "Check failed",
        })
      );
    });
  });
});
