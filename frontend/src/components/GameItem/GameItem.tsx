import { TBasicGame } from "@/models/game";
import React, { memo } from "react";
import { TableCell, TableRow } from "../ui/table";
import dayjs from "dayjs";
import { MdModeEdit, MdOutlineDelete } from "react-icons/md";
import TooltipButton from "../TooltipButton";
import { IoIosPlay } from "react-icons/io";
import Link from "next/link";
import AppRoutes from "@/RoutePaths";
import { useGameContext } from "@/Providers/GameProvider";

type Props = {
  game: TBasicGame;
};

const GameItem = ({ game }: Props) => {
  const { setDeletedGame } = useGameContext();
  return (
    <TableRow className="h-fit">
      <TableCell className="font-medium" colSpan={2}>
        {game.gameName}
      </TableCell>
      <TableCell colSpan={1}>
        {dayjs(game.createdAt).format("DD/MM/YYYY")}
      </TableCell>
      <TableCell colSpan={1}>{game.timeLimit} seconds</TableCell>
      <TableCell colSpan={1} className="flex items-center justify-end !h-fit">
        <TooltipButton
          triggerComponent={
            <Link
              data-testid={`edit-game-btn-${game.gameId}`}
              href={`${AppRoutes.Game}/${game.gameId}`}
            >
              <MdModeEdit className="text-lg mx-2 cursor-pointer" />
            </Link>
          }
          content="Edit game"
        />

        <TooltipButton
          triggerComponent={
            <Link
              href={`${AppRoutes.Game}/${game.gameId}/play`}
              data-testid={`play-game-btn-${game.gameId}`}
            >
              <IoIosPlay className="text-lg mx-2 cursor-pointer" />
            </Link>
          }
          content="Play game"
        />
        <TooltipButton
          triggerComponent={
            <MdOutlineDelete
              className="text-lg mx-2 cursor-pointer"
              color="red"
              onClick={() => setDeletedGame(game)}
              data-testid={`delete-game-btn-${game.gameId}`}
            />
          }
          content="Delete game"
        />
      </TableCell>
    </TableRow>
  );
};

export default memo(GameItem);
