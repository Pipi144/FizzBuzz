"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import useGetGameAttempt from "@/hooks/useGetGameAttempt";
import AppRoutes from "@/RoutePaths";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const GameResult = () => {
  const { attemptId } = useParams<{ gameId: string; attemptId: string }>();
  const router = useRouter();
  const attemptQuery = useGetGameAttempt({
    attemptId,
    onErrorGetGameAttempt(err) {
      toast({
        title: "Failed to get game result",
        description: err.message,
      });
    },
  });
  const attemptData = attemptQuery.data;

  if (attemptQuery.isLoading)
    return <div data-testid="get-attempt-loader">Getting game result...</div>;
  if (!attemptData) return <div>Attempt not found</div>;
  return (
    <div className="w-full h-full max-w-md flex flex-col items-center ">
      <h3 className="font-bold text-2xl md:text-4xl mb-3">Game result</h3>

      <div className="w-full flex items-center justify-between my-3 !text-lg">
        <h5 className="font-bold">Total questions:</h5>
        <p data-testid={`total-question-${attemptId}`}>
          {attemptData.gameQuestions.length}
        </p>
      </div>
      <div className="w-full flex items-center justify-between my-3 !text-lg">
        <h5 className="font-bold ">Correct answers:</h5>
        <p data-testid={`total-correct-${attemptId}`}>
          {attemptData.gameQuestions.filter((q) => q.isCorrectAnswer).length}
        </p>
      </div>
      <div className="w-full flex items-center justify-between my-3 !text-lg">
        <h5 className="font-bold ">Incorrect answers:</h5>
        <p data-testid={`total-incorrect-${attemptId}`}>
          {attemptData.gameQuestions.filter((q) => !q.isCorrectAnswer).length}
        </p>
      </div>
      <div className="w-full flex items-center justify-between my-3 !text-lg">
        <h5 className="font-bold  ">Final score:</h5>
        <p data-testid={`total-score-${attemptId}`}>{attemptData.score}</p>
      </div>

      <Button
        variant="dark"
        className="mt-4"
        onClick={() => router.push(AppRoutes.Game)}
      >
        Play more game
      </Button>
    </div>
  );
};

export default GameResult;
