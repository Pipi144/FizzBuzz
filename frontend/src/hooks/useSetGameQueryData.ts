import { TBasicGame, TGame } from "@/models/game";
import useGenerateQKey from "./useGenerateQKey";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { TGameRule } from "@/models/gameRule";

type Props = {
  addPos?: "start" | "end";
};

const useSetGameQueryData = ({ addPos }: Props = { addPos: "start" }) => {
  const { getGameListQueryKey, getGameDetailQueryKey } = useGenerateQKey();
  const queryClient = useQueryClient();
  const addGameQueryData = (game: TBasicGame) => {
    const qKey = getGameListQueryKey({});
    const gameListQueryDataActive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && query.isActive(),
    });
    const gameListQueryDataInactive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && !query.isActive(),
    });

    gameListQueryDataActive.forEach((query) => {
      queryClient.setQueryData<TBasicGame[]>(query.queryKey, (old) => {
        if (old) {
          return produce(old, (draft) => {
            if (addPos === "start") draft.unshift(game);
            else draft.push(game);

            return draft;
          });
        } else return [game];
      });
    });
    gameListQueryDataInactive.forEach((query) => {
      queryClient.removeQueries(query);
    });
  };

  const editGameQueryData = (game: TBasicGame) => {
    const qKey = getGameListQueryKey({});
    const gameListQueryDataActive = queryClient.getQueryCache().findAll({
      predicate: (query) => qKey.every((key) => query.queryKey.includes(key)),
    });
    const gameListQueryDataInactive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && !query.isActive(),
    });

    gameListQueryDataActive.forEach((query) => {
      queryClient.setQueryData<TBasicGame[]>(query.queryKey, (old) => {
        if (old) {
          return produce(old, (draft) => {
            const foundGame = draft.find((g) => g.gameId === game.gameId);
            if (foundGame) {
              Object.assign(foundGame, game);
            }

            return draft;
          });
        } else return old;
      });
    });
    gameListQueryDataInactive.forEach((query) => {
      queryClient.removeQueries(query);
    });
  };
  const deleteGameQueryData = (gameId: string) => {
    const qKey = getGameListQueryKey({});
    const gameListQueryDataActive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && query.isActive(),
    });
    const gameListQueryDataInactive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && !query.isActive(),
    });

    gameListQueryDataActive.forEach((query) => {
      queryClient.setQueryData<TBasicGame[]>(query.queryKey, (old) => {
        if (old) {
          return produce(old, (draft) => {
            const foundGameIdx = draft.findIndex((g) => g.gameId === gameId);
            if (foundGameIdx !== -1) draft.splice(foundGameIdx, 1);

            return draft;
          });
        } else return old;
      });
    });
    gameListQueryDataInactive.forEach((query) => {
      queryClient.removeQueries(query);
    });
  };
  const addGameRuleQueryData = (gameRule: TGameRule) => {
    const qKey = getGameDetailQueryKey(gameRule.gameId);

    const gameDetailsQueryDataActive = queryClient.getQueryCache().findAll({
      predicate: (query) => qKey.every((key) => query.queryKey.includes(key)),
    });
    const gameDetailsQueryDataInactive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && !query.isActive(),
    });

    gameDetailsQueryDataActive.forEach((query) => {
      queryClient.setQueryData<TGame>(query.queryKey, (old) => {
        if (old) {
          return produce(old, (draft) => {
            draft.gameRules.push(gameRule);

            return draft;
          });
        } else return old;
      });
    });
    gameDetailsQueryDataInactive.forEach((query) => {
      queryClient.removeQueries(query);
    });
  };

  const editGameRuleQueryData = (gameRule: TGameRule) => {
    const qKey = getGameDetailQueryKey(gameRule.gameId);
    const gameDetailsQueryDataActive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && query.isActive(),
    });
    const gameDetailsQueryDataInactive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && !query.isActive(),
    });

    gameDetailsQueryDataActive.forEach((query) => {
      queryClient.setQueryData<TGame>(query.queryKey, (old) => {
        if (old) {
          return produce(old, (draft) => {
            const foundGameRule = draft.gameRules.find(
              (r) => r.ruleId === gameRule.ruleId
            );
            if (foundGameRule) Object.assign(foundGameRule, gameRule);
            return draft;
          });
        } else return old;
      });
    });
    gameDetailsQueryDataInactive.forEach((query) => {
      queryClient.removeQueries(query);
    });
  };

  const deleteGameRuleQueryData = (gameRule: TGameRule) => {
    const qKey = getGameDetailQueryKey(gameRule.gameId);
    const gameDetailsQueryDataActive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && query.isActive(),
    });
    const gameDetailsQueryDataInactive = queryClient.getQueryCache().findAll({
      predicate: (query) =>
        qKey.every((key) => query.queryKey.includes(key)) && !query.isActive(),
    });

    gameDetailsQueryDataActive.forEach((query) => {
      queryClient.setQueryData<TGame>(query.queryKey, (old) => {
        if (old) {
          return produce(old, (draft) => {
            const foundGameRuleIdx = draft.gameRules.findIndex(
              (r) => r.ruleId === gameRule.ruleId
            );
            if (foundGameRuleIdx !== -1)
              draft.gameRules.splice(foundGameRuleIdx, 1);
            return draft;
          });
        } else return old;
      });
    });
    gameDetailsQueryDataInactive.forEach((query) => {
      queryClient.removeQueries(query);
    });
  };
  return {
    addGameQueryData,
    editGameQueryData,
    addGameRuleQueryData,
    editGameRuleQueryData,
    deleteGameQueryData,
    deleteGameRuleQueryData,
  };
};

export default useSetGameQueryData;
