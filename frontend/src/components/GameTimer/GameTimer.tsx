import { useGamePlayContext } from "@/Providers/GamePlayProvider";
import { Variants } from "framer-motion";
import React, { useEffect } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import AnimatedSpan from "../AnimatedComponents/AnimatedSpan";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const formatTime = (seconds: number): string => {
  const time = dayjs.duration(seconds, "seconds");

  return seconds >= 3600
    ? time.format("HH:mm:ss") // Format as HH:mm:ss if 1 hour or more
    : time.format("mm:ss"); // Format as mm:ss otherwise
};
const GameTimer = () => {
  const { timeCountDown, setTimeCountDown, game, attempt, resetGamePlay } =
    useGamePlayContext();
  const router = useRouter();

  const percentage =
    game.timeLimit && timeCountDown
      ? (timeCountDown / game.timeLimit) * 100
      : 0;
  const formattedTime = formatTime(timeCountDown ?? 0);

  const textAnimatedVariants: Variants = {
    initial: {
      color: "#000",
    },
    timesUp: {
      color: ["#000", "#f00", "#000"],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    },
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeCountDown((prev) => (prev ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeCountDown]);

  // if user is in the middle of the game and tries to close the tab
  // we want to prevent the user from closing the tab

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();

      event.returnValue =
        "You haven't done the game, Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // times up => navigate to the result page
  useEffect(() => {
    if (timeCountDown === 0) {
      router.replace(`/game/${game.gameId}/${attempt?.attemptId}`);
      resetGamePlay();
    }
  }, [timeCountDown]);

  if (!timeCountDown) return null;
  return (
    <div className="w-20 h-20 self-center">
      {game.timeLimit && (
        <CircularProgressbarWithChildren
          value={percentage}
          styles={{
            path: {
              stroke: "#22D3EE",
              strokeWidth: "6px", // Thickness of the path
              strokeLinecap: "round", // Rounded ends for the progress path
            },
            trail: {
              stroke: "black", // Color of the trail
              strokeWidth: "8px", // Thickness of the trail
              strokeLinecap: "round", // Rounded ends for the trail
            },
            root: {
              padding: 4,
            },
          }}
        >
          <AnimatedSpan
            className=" font-concert text-xs font-medium"
            animate={percentage <= 15 && percentage > 0 ? "timesUp" : "initial"}
            variants={textAnimatedVariants}
          >
            {formattedTime}
          </AnimatedSpan>
        </CircularProgressbarWithChildren>
      )}
    </div>
  );
};

export default GameTimer;
