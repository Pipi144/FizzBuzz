import {
  TAddGameAttemptPayload,
  TCheckAnswerPayload,
  TGameAttempt,
} from "@/models/gameAttempt";
import { TServerError } from "@/models/ServerErrorRespond";
import useGenerateMutationKey from "./useGenerateMutationKey";
import { useMutation } from "@tanstack/react-query";
import {
  checkAnswerApi,
  createGameAttemptApi,
  generateGameQuestionApi,
} from "@/apis/gameAttempt";
import { TGameQuestion } from "@/models/gameQuestion";

type Props = {
  onSuccessCreateGameAttempt?: (gameAttempt: TGameAttempt) => void;
  onErrorCreateGameAttempt?: (err: TServerError) => void;
  onSuccessGenerateQuestion?: (gameQuestion: TGameQuestion) => void;
  onErrorGenerateQuestion?: (err: TServerError) => void;
  onSuccessCheckAnswer?: (gameQuestion: TGameQuestion) => void;
  onErrorCheckAnswer?: (err: TServerError) => void;
};

const useMutateGameAttempt = (props: Props = {}) => {
  const { getMutateGameAttemptKey } = useGenerateMutationKey();
  const createGameAttempt = useMutation<
    TGameAttempt,
    TServerError,
    TAddGameAttemptPayload
  >({
    mutationKey: getMutateGameAttemptKey("add"),
    mutationFn: createGameAttemptApi,
    onSuccess: (data) => {
      if (props.onSuccessCreateGameAttempt)
        props.onSuccessCreateGameAttempt(data);
    },
    onError: (err) => {
      if (props.onErrorCreateGameAttempt) props.onErrorCreateGameAttempt(err);
    },
  });

  const generateQuestion = useMutation<TGameQuestion, TServerError, string>({
    mutationKey: getMutateGameAttemptKey("generate-question"),
    mutationFn: generateGameQuestionApi,
    onSuccess: (data) => {
      if (props.onSuccessGenerateQuestion)
        props.onSuccessGenerateQuestion(data);
    },
    onError: (err) => {
      if (props.onErrorGenerateQuestion) props.onErrorGenerateQuestion(err);
    },
  });
  const checkQuestion = useMutation<
    TGameQuestion,
    TServerError,
    TCheckAnswerPayload
  >({
    mutationKey: getMutateGameAttemptKey("check"),
    mutationFn: checkAnswerApi,
    onSuccess: (data) => {
      if (props.onSuccessCheckAnswer) props.onSuccessCheckAnswer(data);
    },
    onError: (err) => {
      if (props.onErrorCheckAnswer) props.onErrorCheckAnswer(err);
    },
  });
  return { createGameAttempt, generateQuestion, checkQuestion };
};

export default useMutateGameAttempt;
