import { useQuery } from "@tanstack/react-query";
import useGenerateQKey from "./useGenerateQKey";
import { getGameAttemptApi } from "@/apis/gameAttempt";
import { TServerError } from "@/models/ServerErrorRespond";
import { TGameAttempt } from "@/models/gameAttempt";

type Props = {
  attemptId: string;
  onErrorGetGameAttempt?: (err: TServerError) => void;
};

const useGetGameAttempt = ({ attemptId, onErrorGetGameAttempt }: Props) => {
  const { getGameAttemptQKey } = useGenerateQKey();
  return useQuery<TGameAttempt, TServerError>({
    queryKey: getGameAttemptQKey(attemptId),
    queryFn: async () => {
      try {
        return await getGameAttemptApi(attemptId);
      } catch (error) {
        onErrorGetGameAttempt?.(error as TServerError);
        throw error;
      }
    },
    gcTime: 1000 * 60 * 2, // Cache for 1 minute
    staleTime: 1000 * 60 * 1, // Stale after 1 minute
  });
};

export default useGetGameAttempt;
