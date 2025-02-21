import useGenerateQKey from "./useGenerateQKey";
import { useQuery } from "@tanstack/react-query";
import { TGame } from "@/models/game";
import { TServerError } from "@/models/ServerErrorRespond";
import { getGameDetailApi } from "@/apis/game";

type Props = {
  gameId: string;
  onErrorGetGameDetail?: (error: TServerError) => void;
  onSuccessGetGameDetail?: (data: TGame) => void;
};

const useGetGameDetail = ({
  gameId,
  onErrorGetGameDetail,
  onSuccessGetGameDetail,
}: Props) => {
  const { getGameDetailQueryKey } = useGenerateQKey();

  return useQuery<TGame, TServerError>({
    queryKey: getGameDetailQueryKey(gameId),
    queryFn: async () => {
      try {
        const res = await getGameDetailApi(gameId);
        onSuccessGetGameDetail?.(res);
        return res;
      } catch (error) {
        onErrorGetGameDetail?.(error as TServerError);
        throw error;
      }
    },
    gcTime: 1000 * 60 * 5, // Cache for 5
    staleTime: 0, // Never stale
  });
};

export default useGetGameDetail;
