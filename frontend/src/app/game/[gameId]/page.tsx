"use client";
import EditGameRule from "@/components/EditGameRule/EditGameRule";
import LoaderOverlay from "@/components/LoaderOverlay";
import TextFieldWithLabel from "@/components/TextFieldWithLabel/TextFieldWithLabel";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import useGetGameDetail from "@/hooks/useGetGameDetail";
import useMutateGame from "@/hooks/useMutateGame";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import { TGame } from "@/models/game";
import AppRoutes from "@/RoutePaths";
import { findErrors } from "@/utils/helperFncs";
import { produce } from "immer";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import * as z from "zod";

const schema = z.object({
  gameName: z.string().min(5, "Game name required and at least 5 characters"),
  timeLimit: z.number().int().positive("Time limit must be positive"),
  numberRange: z.number().int().positive("Number range must be positive"),
});

const EditGame = () => {
  const [gameDetails, setGameDetails] = useState<TGame | undefined>(undefined);
  const [errorFields, setErrorFields] = useState<{
    gameNameError?: string[];
    timeLimitError?: string[];
    numberRangeError?: string[];
  }>({});
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const gameDetailQuery = useGetGameDetail({
    gameId,
    onSuccessGetGameDetail(data) {
      setGameDetails(data);
    },
  });
  const gameData = gameDetailQuery.data;
  const { editGameQueryData } = useSetGameQueryData();
  const { editGame } = useMutateGame({
    onSuccessEditGame(game) {
      editGameQueryData(game); // this is the query data in game list
      router.push(AppRoutes.Game);
    },
    onErrorEditGame(error) {
      toast({
        title: "Update failed",
        description: error.message,
      });
    },
  });
  const handleEditGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!gameDetails) return;

    const validation = schema.safeParse({
      gameName: gameDetails.gameName,
      timeLimit: gameDetails.timeLimit,
      numberRange: gameDetails.numberRange,
    });
    if (!validation.success) {
      setErrorFields({
        gameNameError: findErrors("gameName", validation.error.issues),
        timeLimitError: findErrors("timeLimit", validation.error.issues),
        numberRangeError: findErrors("numberRange", validation.error.issues),
      });

      return;
    }

    editGame.mutate({
      gameId,
      gameName: gameDetails.gameName,
      timeLimit: gameDetails.timeLimit,
      numberRange: gameDetails.numberRange,
    });
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
    }
  };

  const onGameDetailsInputChange = (
    fields: keyof Pick<TGame, "gameName" | "timeLimit" | "numberRange">,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGameDetails(
      produce((draft) => {
        if (!draft) return;
        if (fields === "gameName") {
          draft.gameName = e.target.value;
        } else if (fields === "timeLimit") {
          draft.timeLimit = parseInt(e.target.value);
        } else if (fields === "numberRange") {
          draft.numberRange = parseInt(e.target.value);
        }
      })
    );
  };
  if (gameDetailQuery.isLoading)
    return (
      <div data-testid="loading-game-details">Getting game details ...</div>
    );
  if (!gameData) return <div>Game not found</div>;
  return (
    <form
      className="flex w-full h-full flex-col px-[20px] items-center max-w-2xl"
      onSubmit={handleEditGame}
      role="form"
    >
      <h3 className="text-lg md:text-2xl font-bold font-concert">Edit game</h3>

      <div className="flex justify-between flex-wrap w-full mt-4">
        <TextFieldWithLabel
          name="gameName"
          labelText="Game name *"
          value={gameDetails?.gameName ?? ""}
          onChange={(e) => onGameDetailsInputChange("gameName", e)}
          placeholder="Enter game name"
          fieldError={errorFields.gameNameError}
          onKeyDown={onKeyDown}
        />

        <TextFieldWithLabel
          name="timeLimit"
          labelText="Time limit (second)"
          value={gameDetails?.timeLimit ?? 0}
          onChange={(e) => onGameDetailsInputChange("timeLimit", e)}
          placeholder="Enter time limit"
          type="number"
          fieldError={errorFields.timeLimitError}
          pattern="\d+" // only allow numbers
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // Remove non-numeric characters
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <div className="flex items-center justify-between flex-wrap w-full mt-4">
        <TextFieldWithLabel
          name="numberRange"
          labelText="Range"
          value={gameDetails?.numberRange ?? 0}
          onChange={(e) => onGameDetailsInputChange("numberRange", e)}
          placeholder="Enter max range"
          type="number"
          fieldError={errorFields.numberRangeError}
          pattern="\d+" // only allow numbers
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // Remove non-numeric characters
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <EditGameRule game={gameData} />

      <div className="flex items-center justify-end w-full mt-4">
        <Button
          variant="outline"
          className="mx-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(AppRoutes.Game);
          }}
        >
          Cancel
        </Button>

        <Button variant="dark" type="submit">
          Submit
        </Button>
      </div>

      <LoaderOverlay
        isOpen={editGame.isPending}
        message={"Updating game..."}
        hideCloseButton
      />
    </form>
  );
};

export default EditGame;
