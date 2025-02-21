import useMutateGameAttempt from "@/hooks/useMutateGameAttempt";
import { TGame } from "@/models/game";
import { TGameAttempt } from "@/models/gameAttempt";
import { TGameQuestion } from "@/models/gameQuestion";
import { useAuthStore } from "@/stores/authStore";
import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";

type Props = PropsWithChildren & {
  game: TGame;
};

interface IGamePlayContextValue {
  timeCountDown: number | null;
  setTimeCountDown: React.Dispatch<React.SetStateAction<number | null>>;
  currentQuestion: TGameQuestion | undefined;
  setCurrentQuestion: React.Dispatch<
    React.SetStateAction<TGameQuestion | undefined>
  >;
  attempt: TGameAttempt | undefined;
  game: TGame;
  resetGamePlay: () => void;
}

const GamePlayContext = React.createContext<IGamePlayContextValue | null>(null);
const GamePlayProvider = ({ game, children }: Props) => {
  const [timeCountDown, setTimeCountDown] = useState<number | null>(
    null //convert to seconds
  );
  const [currentQuestion, setCurrentQuestion] = useState<
    TGameQuestion | undefined
  >(undefined);
  const [attempt, setAttempt] = useState<TGameAttempt | undefined>(undefined);
  const { currentUser } = useAuthStore(
    useShallow((state) => ({ currentUser: state.currentUser }))
  );

  const { createGameAttempt, generateQuestion } = useMutateGameAttempt({
    onSuccessCreateGameAttempt(gameAttempt) {
      setAttempt(gameAttempt);
      generateQuestion.mutate(gameAttempt.attemptId);
    },
    onErrorCreateGameAttempt(err) {
      throw new Error(err.message);
    },
    onSuccessGenerateQuestion(gameQuestion) {
      setCurrentQuestion(gameQuestion);
      if (!timeCountDown) setTimeCountDown(game.timeLimit);
    },
    onErrorGenerateQuestion(err) {
      throw new Error(err.message);
    },
  });
  const resetGamePlay = () => {
    setTimeCountDown(null);
    setCurrentQuestion(undefined);
    setAttempt(undefined);
  };

  const hasAttempted = useRef(false);

  useEffect(() => {
    if (
      attempt ||
      hasAttempted.current ||
      createGameAttempt.isPending ||
      !currentUser
    )
      return;

    hasAttempted.current = true; // Mark as run
    createGameAttempt.mutate({
      gameId: game.gameId,
      attemptByUserId: currentUser.userId,
    });
  }, [attempt, createGameAttempt.isPending, currentUser]);

  const contextVal: IGamePlayContextValue = useMemo(
    () => ({
      timeCountDown,
      setTimeCountDown,
      currentQuestion,
      setCurrentQuestion,
      attempt,
      game,
      resetGamePlay,
    }),
    [timeCountDown, currentQuestion, attempt, game]
  );
  return (
    <GamePlayContext.Provider value={contextVal}>
      {children}
    </GamePlayContext.Provider>
  );
};

export default GamePlayProvider;

export const useGamePlayContext = () => {
  const context = React.useContext(GamePlayContext);
  if (!context) {
    throw new Error("useGamePlayContext must be used within GamePlayProvider");
  }
  return context;
};
