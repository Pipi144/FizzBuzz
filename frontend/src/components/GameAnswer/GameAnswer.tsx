import { useGamePlayContext } from "@/Providers/GamePlayProvider";
import React from "react";
import { Input } from "../ui/input";
import { produce } from "immer";
import useMutateGameAttempt from "@/hooks/useMutateGameAttempt";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import useGenerateMutationKey from "@/hooks/useGenerateMutationKey";
import { useIsMutating } from "@tanstack/react-query";
import LoaderOverlay from "../LoaderOverlay";
import RuleItemDisplay from "../RuleItemDisplay/RuleItemDisplay";
import { TAddGameAttemptPayload } from "@/models/gameAttempt";

const GameAnswer = () => {
  const { currentQuestion, setCurrentQuestion, game } = useGamePlayContext();
  const { checkQuestion } = useMutateGameAttempt({
    onErrorCheckAnswer(err) {
      toast({
        title: "Something went wrong",
        description: err.message,
      });
    },
    onSuccessCheckAnswer(gameQuestion) {
      setCurrentQuestion(gameQuestion);
    },
  });
  const onCheckAnswer = () => {
    if (currentQuestion)
      checkQuestion.mutate({
        questionId: currentQuestion.id,
        answer: currentQuestion.userAnswer,
      });
  };
  const { getMutateGameAttemptKey } = useGenerateMutationKey();

  const isCreatingAttempt =
    useIsMutating({
      mutationKey: getMutateGameAttemptKey("add"),
      predicate: (query) =>
        (query.state.variables as TAddGameAttemptPayload).gameId ===
        game.gameId,
    }) > 0; // check if in process of creating attempt for the game
  const isGeneratingQuestion =
    useIsMutating({
      mutationKey: getMutateGameAttemptKey("generate-question"),
    }) > 0;

  return (
    <>
      <div className="flex flex-col w-full px-2 py-1 border-solid border-2 border-gray-300 rounded-md items-center mt-3">
        <h3 className="font-bold my-3 ">Rules</h3>
        <div className="w-full flex flex-wrap items-center justify-around">
          {game.gameRules.map((rule, index) => (
            <RuleItemDisplay rule={rule} index={index} key={rule.ruleId} />
          ))}
        </div>
      </div>
      {currentQuestion && (
        <div className="flex w-full h-full flex-col px-[20px] items-center mt-5">
          <h1
            data-testid={`question-number`}
            className="text-2xl md:text-7xl font-bold my-3 md:my-8"
          >
            {currentQuestion.questionNumber}
          </h1>
          <div className="flex items-center justify-between max-w-screen-sm  my-4 flex-wrap border-[1px] border-solid border-slate-400 px-2 rounded-sm">
            <b>Answer:</b>
            <Input
              placeholder="Enter your answer..."
              className="placeholder:text-slate-400 w-40 m-2 border-[0px] rounded-none !border-b-[1px] border-slate-400 shadow-none px-0 h-fit"
              value={currentQuestion.userAnswer}
              onChange={(e) =>
                setCurrentQuestion(
                  produce((draft) => {
                    if (draft) draft.userAnswer = e.target.value;

                    return draft;
                  })
                )
              }
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  onCheckAnswer();
                }
              }}
            />
          </div>
          <Button
            variant="dark"
            onClick={onCheckAnswer}
            disabled={checkQuestion.isPending}
          >
            {checkQuestion.isPending ? (
              <Spinner size="small" className="text-white" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      )}
      <LoaderOverlay
        isOpen={isCreatingAttempt || isGeneratingQuestion}
        message={
          isCreatingAttempt ? "Initializing game..." : "Generating question..."
        }
      />
    </>
  );
};

export default GameAnswer;
