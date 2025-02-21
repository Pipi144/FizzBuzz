import { TAddGamePayload, TBasicGame } from "@/models/game";
import { useAuthStore } from "@/stores/authStore";
import { produce } from "immer";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";

type Props = PropsWithChildren;

type TGameContextValue = {
  searchGameValue: string;
  setSearchGameValue: React.Dispatch<React.SetStateAction<string>>;
  addGamePayload: TAddGamePayload;
  setAddGamePayload: React.Dispatch<React.SetStateAction<TAddGamePayload>>;
  resetAddGamePayload: () => void;
  deletedGame: TBasicGame | undefined;
  setDeletedGame: React.Dispatch<React.SetStateAction<TBasicGame | undefined>>;
};
const GameContext = React.createContext<TGameContextValue | null>(null);
const GameProvider = ({ children }: Props) => {
  const { currentUser } = useAuthStore(
    useShallow((state) => ({ currentUser: state.currentUser }))
  );
  const [addGamePayload, setAddGamePayload] = useState<TAddGamePayload>({
    gameName: "",
    timeLimit: 60,
    createdByUserId: currentUser?.userId.toString() ?? "0",
    gameRules: [],
    numberRange: 10,
  });

  const [deletedGame, setDeletedGame] = useState<TBasicGame | undefined>(
    undefined
  );
  const resetAddGamePayload = useCallback(() => {
    setAddGamePayload({
      gameName: "",
      timeLimit: 60,
      createdByUserId: currentUser?.userId.toString() ?? "0",
      gameRules: [],
      numberRange: 10,
    });
  }, [currentUser]);
  const [searchGameValue, setSearchGameValue] = useState("");

  const contextVal: TGameContextValue = useMemo(
    () => ({
      searchGameValue,
      setSearchGameValue,
      addGamePayload,
      setAddGamePayload,
      resetAddGamePayload,
      deletedGame,
      setDeletedGame,
    }),
    [searchGameValue, addGamePayload, resetAddGamePayload, deletedGame]
  );
  useEffect(() => {
    if (currentUser)
      setAddGamePayload(
        produce((draft) => {
          draft.createdByUserId = currentUser?.userId.toString();
        })
      );
  }, [currentUser]);

  return (
    <GameContext.Provider value={contextVal}>{children}</GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
export default GameProvider;
