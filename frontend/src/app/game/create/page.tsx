"use client";
import TextFieldWithLabel from "@/components/TextFieldWithLabel/TextFieldWithLabel";
import { TAddGamePayload } from "@/models/game";
import { produce } from "immer";
import React, { useState } from "react";
import * as z from "zod";
import AddGameRule from "@/components/AddGameRule/AddGameRule";
import { useGameContext } from "@/Providers/GameProvider";
import { Button } from "@/components/ui/button";
import useMutateGame from "@/hooks/useMutateGame";
import LoaderOverlay from "@/components/LoaderOverlay";
import { findErrors } from "@/utils/helperFncs";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AppRoutes from "@/RoutePaths";

const schema = z.object({
  gameName: z.string().min(5, "Game name required and at least 5 characters"),
  timeLimit: z.number().min(10, "Minimum input is 10"),
  numberRange: z.number().int().positive("Number range must be positive"),
});
const AddGame = () => {
  const [errorFields, setErrorFields] = useState<{
    gameNameError?: string[];
    timeLimitError?: string[];
    numberRangeError?: string[];
  }>({});
  const router = useRouter();
  const { addGamePayload, setAddGamePayload, resetAddGamePayload } =
    useGameContext();
  const { addGameQueryData } = useSetGameQueryData();
  const { createGame } = useMutateGame({
    onSuccessAddGame: (game) => {
      addGameQueryData(game);
      router.replace(AppRoutes.Game);
      resetAddGamePayload();
    },
    onErrorAddGame: (err) =>
      toast({ title: "Error", description: err.message }),
  });

  const handlePayloadChange = (
    key: keyof Omit<TAddGamePayload, "gameRules">,
    value: string
  ) => {
    setAddGamePayload(
      produce((draft) => {
        if (key === "numberRange" || key === "timeLimit")
          draft[key] = Number(value);
        else draft[key] = value.toString();
      })
    );
  };

  const handleAddGame = () => {
    const validation = schema.safeParse({
      gameName: addGamePayload.gameName,
      timeLimit: addGamePayload.timeLimit,
      numberRange: addGamePayload.numberRange,
    });
    if (!validation.success) {
      setErrorFields({
        gameNameError: findErrors("gameName", validation.error.issues),
        timeLimitError: findErrors("timeLimit", validation.error.issues),
        numberRangeError: findErrors("numberRange", validation.error.issues),
      });

      return;
    }
    if (addGamePayload.gameRules.length === 0) {
      toast({
        title: "Rule required",
        description: "Please add at least one rule",
      });
      return;
    }

    createGame.mutate(addGamePayload);
  };
  return (
    <div className="flex w-full h-full flex-col px-[20px] items-center max-w-2xl">
      <h3 className="text-lg md:text-2xl font-bold font-concert">
        Create game
      </h3>

      <div className="flex justify-between flex-wrap w-full mt-4">
        <TextFieldWithLabel
          labelText="Game name *"
          value={addGamePayload.gameName}
          onChange={(e) => handlePayloadChange("gameName", e.target.value)}
          placeholder="Enter game name"
          fieldError={errorFields.gameNameError}
        />

        <TextFieldWithLabel
          labelText="Time limit (second)"
          value={addGamePayload.timeLimit}
          onChange={(e) => handlePayloadChange("timeLimit", e.target.value)}
          placeholder="Enter time limit"
          type="number"
          fieldError={errorFields.timeLimitError}
          pattern="\d+" // only allow numbers
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // Remove non-numeric characters
          }}
        />
      </div>

      <div className="flex items-center justify-between flex-wrap w-full mt-4">
        <TextFieldWithLabel
          labelText="Range"
          value={addGamePayload.numberRange}
          onChange={(e) => handlePayloadChange("numberRange", e.target.value)}
          placeholder="Enter max range"
          type="number"
          fieldError={errorFields.numberRangeError}
          pattern="\d+" // only allow numbers
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); // Remove non-numeric characters
          }}
        />
      </div>

      <AddGameRule />

      <div className="flex items-center justify-end w-full mt-4">
        <Button
          variant="outline"
          className="mx-2"
          onClick={() => router.push(AppRoutes.Game)}
        >
          Cancel
        </Button>
        <Button variant="dark" onClick={handleAddGame}>
          Submit
        </Button>
      </div>
      <LoaderOverlay
        isOpen={createGame.isPending}
        message="Creating game..."
        hideCloseButton
      />
    </div>
  );
};

export default AddGame;
