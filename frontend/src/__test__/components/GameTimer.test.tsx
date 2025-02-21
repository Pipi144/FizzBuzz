import GameTimer from "@/components/GameTimer/GameTimer";
import { TGame } from "@/models/game";
import { useGamePlayContext } from "@/Providers/GamePlayProvider";
import { act, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";

//mock loader
jest.mock("@/components/LoaderOverlay", () => {
  const MockOverlay = () => <div data-testid="mock-loader">Loader</div>;
  return MockOverlay;
});
// mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// mock GamePlayProvider
jest.mock("@/Providers/GamePlayProvider", () => ({
  useGamePlayContext: jest.fn(),
}));

// mock data
const mockGame: TGame = {
  gameId: "1",
  gameName: "Game 1",
  timeLimit: 80,
  numberRange: 100,
  createdAt: new Date().toISOString(),
  createdByUserId: "1",
  gameRules: [
    { divisibleNumber: 3, replacedWord: "Fizz", ruleId: "1", gameId: "1" },
  ],
  user: {
    userId: "1",
    username: "user1",
  },
};
const renderGameTimer = () => render(<GameTimer />);

// ** Test **
describe("GameTimer Component Test", () => {
  let mockSetTimeCountDown: jest.Mock;
  let mockResetGamePlay: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSetTimeCountDown = jest.fn();
    mockResetGamePlay = jest.fn();
    mockReplace = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });

    (useGamePlayContext as jest.Mock).mockReturnValue({
      timeCountDown: 80,
      setTimeCountDown: mockSetTimeCountDown,
      game: mockGame,
      attempt: { attemptId: "456" },
      resetGamePlay: mockResetGamePlay,
    });
  });

  it("renders correctly with a time limit", () => {
    renderGameTimer();

    expect(screen.getByText("01:20")).toBeInTheDocument();
  });

  it("counts down the timer every second", () => {
    jest.useFakeTimers(); // Enable fake timers
    render(<GameTimer />);

    act(() => {
      jest.advanceTimersByTime(1000); // Move forward by 1 second
    });

    expect(mockSetTimeCountDown).toHaveBeenCalledWith(expect.any(Function));
  });

  it("navigates to the result page when the timer reaches zero", () => {
    (useGamePlayContext as jest.Mock).mockReturnValue({
      timeCountDown: 0,
      setTimeCountDown: mockSetTimeCountDown,
      game: { timeLimit: 10, gameId: "123" },
      attempt: { attemptId: "456" },
      resetGamePlay: mockResetGamePlay,
    });

    render(<GameTimer />);

    expect(mockReplace).toHaveBeenCalledWith("/game/123/456");
    expect(mockResetGamePlay).toHaveBeenCalled();
  });

  it("prevents users from closing the tab while the game is in progress", () => {
    render(<GameTimer />);

    const event = new Event("beforeunload");
    Object.defineProperty(event, "preventDefault", { value: jest.fn() });

    window.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });
});
