import { addGameApi, deleteGameApi, editGameApi } from "@/apis/game";
import { TAddGamePayload, TGame, TUpdateGamePayload } from "@/models/game";
import { TServerError } from "@/models/ServerErrorRespond";
import { useMutation } from "@tanstack/react-query";
import useGenerateMutationKey from "./useGenerateMutationKey";

type Props = {
  onSuccessAddGame?: (game: TGame) => void;
  onErrorAddGame?: (error: TServerError) => void;
  onSuccessEditGame?: (game: TGame) => void;
  onErrorEditGame?: (error: TServerError) => void;
  onSuccessDeleteGame?: (gameId: string) => void;
  onErrorDeleteGame?: (error: TServerError) => void;
};

const useMutateGame = (props: Props = {}) => {
  const { getMutateGameKey } = useGenerateMutationKey();
  const createGame = useMutation<TGame, TServerError, TAddGamePayload>({
    mutationKey: getMutateGameKey("add"),
    mutationFn: addGameApi,
    onSuccess: (data) => {
      if (props.onSuccessAddGame) props.onSuccessAddGame(data);
    },
    onError: (err) => {
      if (props.onErrorAddGame) props.onErrorAddGame(err);
    },
  });

  const editGame = useMutation<TGame, TServerError, TUpdateGamePayload>({
    mutationKey: getMutateGameKey("update"),
    mutationFn: editGameApi,
    onSuccess: (data) => {
      if (props.onSuccessEditGame) props.onSuccessEditGame(data);
    },
    onError: (err) => {
      if (props.onErrorEditGame) props.onErrorEditGame(err);
    },
  });

  const deleteGame = useMutation<unknown, TServerError, string>({
    mutationKey: getMutateGameKey("delete"),
    mutationFn: deleteGameApi,
    onSuccess: (data, variables) => {
      if (props.onSuccessDeleteGame) props.onSuccessDeleteGame(variables);
    },
    onError: (err) => {
      if (props.onErrorDeleteGame) props.onErrorDeleteGame(err);
    },
  });
  return {
    createGame,
    editGame,
    deleteGame,
  };
};

export default useMutateGame;
