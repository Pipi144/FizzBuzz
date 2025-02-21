import { getGameListApi } from "@/apis/game";
import { TBasicGame, TGetGameParams } from "@/models/game";
import { TServerError } from "@/models/ServerErrorRespond";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import useGenerateQKey from "./useGenerateQKey";

type Props = {
  filter?: TGetGameParams;
  onErrorGetGame?: (err: TServerError) => void;
};

const useGetGame = ({ filter, onErrorGetGame }: Props = {}): UseQueryResult<
  TBasicGame[],
  TServerError
> => {
  const { getGameListQueryKey } = useGenerateQKey();
  return useQuery<TBasicGame[], TServerError>({
    queryKey: getGameListQueryKey(filter),
    queryFn: async () => {
      try {
        return await getGameListApi(filter);
      } catch (error) {
        onErrorGetGame?.(error as TServerError);
        throw error;
      }
    },
    gcTime: 1000 * 60 * 10, // Cache for 15 minutes
    staleTime: 60 * 1000 * 8, // Stale after 5 minutes
  });
};

export default useGetGame;
