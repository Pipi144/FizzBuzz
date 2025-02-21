"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import GameTable from "@/components/GameTable/GameTable";
import SearchGame from "@/components/SearchGame/SearchGame";
import TooltipButton from "@/components/TooltipButton";
import { Button } from "@/components/ui/button";
import useMutateGame from "@/hooks/useMutateGame";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import { useGameContext } from "@/Providers/GameProvider";
import AppRoutes from "@/RoutePaths";
import Link from "next/link";
import React from "react";
import { IoIosAddCircle } from "react-icons/io";

const GameList = () => {
  const { deletedGame, setDeletedGame } = useGameContext();
  const { deleteGameQueryData } = useSetGameQueryData();
  const { deleteGame } = useMutateGame({
    onSuccessDeleteGame(gameId) {
      deleteGameQueryData(gameId);
      setDeletedGame(undefined);
    },
  });
  return (
    <div className="flex w-full h-full flex-col px-[20px] ">
      <div className="flex w-full justify-between items-center">
        <h3 className="text-lg md:text-2xl font-bold font-concert">
          All games
        </h3>

        <SearchGame />
        <Link
          data-testid="add-game-link"
          href={AppRoutes.CreateGame}
          className="ml-2 flex items-center"
        >
          <TooltipButton
            triggerComponent={<IoIosAddCircle className="text-2xl" />}
            content="Create new game"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col mt-4 overflow-hidden">
        <GameTable />
      </div>

      <ConfirmDialog
        open={!!deletedGame}
        onOpenChange={(open) => {
          if (!open) setDeletedGame(undefined);
        }}
        title="Confirm delete game"
        description={`Are you sure you want to delete ***${deletedGame?.gameName}***`}
        footerContent={
          <>
            <Button
              role="button"
              variant="outline"
              onClick={() => setDeletedGame(undefined)}
            >
              Cancel
            </Button>
            <Button
              data-testid="confirm-delete-btn"
              variant="dark"
              onClick={() => deleteGame.mutate(deletedGame?.gameId ?? "")}
              disabled={deleteGame.isPending}
            >
              {deleteGame.isPending ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      />
    </div>
  );
};

export default GameList;
