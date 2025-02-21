import React, { useState } from "react";
import { Label } from "../ui/label";
import { toast } from "@/hooks/use-toast";
import useMutateGameRule from "@/hooks/useMutateGameRule";
import { TGame } from "@/models/game";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import RuleItem from "../RuleItem/RuleItem";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";

type Props = {
  game: TGame;
};

const EditGameRule = ({ game }: Props) => {
  const [newNumber, setNewNumber] = useState("");
  const [newReplaceWord, setNewReplaceWord] = useState("");
  const { addGameRuleQueryData } = useSetGameQueryData();
  const { createGameRule } = useMutateGameRule({
    onSuccessAddGameRule: (rule) => {
      addGameRuleQueryData(rule);
      setNewNumber("");
      setNewReplaceWord("");
    },
    onErrorAddGameRule: (error) => {
      toast({
        title: "Add failed",
        description: error.message,
      });
    },
  });
  const onAddNewRule = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!newNumber || !newReplaceWord) {
      toast({
        title: "Fields are required",
        description: "Please fill in all fields",
      });
      return;
    }
    if (
      game.gameRules.some((rule) => rule.divisibleNumber === Number(newNumber))
    ) {
      toast({
        title: "Rule already exists",
        description: "Rule with this divisible number already exists",
      });
      return;
    }
    createGameRule.mutate({
      gameId: game.gameId,
      divisibleNumber: Number(newNumber),
      replacedWord: newReplaceWord,
    });
  };

  const handleAddInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddNewRule();
    }
  };

  return (
    <div className="mt-4 w-full flex-wrap">
      <Label>Game rules</Label>
      <div className="flex items-center justify-between w-full max-w-screen-sm  my-4 flex-wrap border-[1px] border-solid border-slate-400 px-2 rounded-sm">
        <Input
          data-testid="edit-rule-add-divisible-number"
          placeholder="Enter divisible number"
          className="placeholder:text-slate-400 w-full md:w-1/3 m-2 border-[0px] rounded-none !border-b-[1px] border-slate-400 shadow-none p-0"
          type="number"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          onKeyDown={handleAddInputKeyDown}
        />
        <Input
          data-testid="edit-rule-add-replace-word"
          placeholder="Enter replaced word"
          className="placeholder:text-slate-400 w-full md:w-1/3 m-2 border-[0px] rounded-none !border-b-[1px] border-slate-400 shadow-none p-0"
          value={newReplaceWord}
          onChange={(e) => setNewReplaceWord(e.target.value)}
          onKeyDown={handleAddInputKeyDown}
        />

        <Button
          onClick={onAddNewRule}
          className="m-2 ml-auto md:ml-2"
          variant="dark"
          disabled={createGameRule.isPending}
        >
          {createGameRule.isPending ? "Adding..." : "Add rule"}
        </Button>
      </div>
      <div className="w-full flex flex-col items-center flex-wrap my-2 justify-around">
        {game.gameRules.map((rule, index) => (
          <RuleItem key={index} rule={rule} index={index} />
        ))}
      </div>
    </div>
  );
};

export default EditGameRule;
