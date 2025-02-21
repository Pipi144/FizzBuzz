import {
  TAddGameRulePayload,
  TGameRule,
  TUpdateGameRulePayload,
} from "@/models/gameRule";
import { TServerError } from "@/models/ServerErrorRespond";
import useGenerateMutationKey from "./useGenerateMutationKey";
import { useMutation } from "@tanstack/react-query";
import {
  addGameRuleApi,
  deleteGameRuleApi,
  editGameRuleApi,
} from "@/apis/gameRule";

type Props = {
  onSuccessAddGameRule?: (rule: TGameRule) => void;
  onErrorAddGameRule?: (error: TServerError) => void;
  onSuccessEditGameRule?: (rule: TGameRule) => void;
  onErrorEditGameRule?: (error: TServerError) => void;
  onSuccessDeleteGameRule?: (ruleId: string) => void;
  onErrorDeleteGameRule?: (error: TServerError) => void;
};

const useMutateGameRule = (props: Props = {}) => {
  const { getMutateGameRuleKey } = useGenerateMutationKey();

  const createGameRule = useMutation<
    TGameRule,
    TServerError,
    TAddGameRulePayload
  >({
    mutationKey: getMutateGameRuleKey("add"),
    mutationFn: addGameRuleApi,
    onSuccess: (data) => {
      if (props.onSuccessAddGameRule) props.onSuccessAddGameRule(data);
    },
    onError: (err) => {
      if (props.onErrorAddGameRule) props.onErrorAddGameRule(err);
    },
  });

  const editGameRule = useMutation<
    TGameRule,
    TServerError,
    TUpdateGameRulePayload
  >({
    mutationKey: getMutateGameRuleKey("update"),
    mutationFn: editGameRuleApi,
    onSuccess: (data) => {
      if (props.onSuccessEditGameRule) props.onSuccessEditGameRule(data);
    },
    onError: (err) => {
      if (props.onErrorEditGameRule) props.onErrorEditGameRule(err);
    },
  });

  const deleteGameRule = useMutation<unknown, TServerError, string>({
    mutationKey: getMutateGameRuleKey("delete"),
    mutationFn: deleteGameRuleApi,
    onSuccess: (data, variables) => {
      if (props.onSuccessDeleteGameRule)
        props.onSuccessDeleteGameRule(variables);
    },
    onError: (err) => {
      if (props.onErrorDeleteGameRule) props.onErrorDeleteGameRule(err);
    },
  });
  return {
    createGameRule,
    editGameRule,
    deleteGameRule,
  };
};

export default useMutateGameRule;
