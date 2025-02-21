import { TGameRule } from "@/models/gameRule";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { produce } from "immer";
import { Button } from "../ui/button";
import useSetGameQueryData from "@/hooks/useSetGameQueryData";
import useMutateGameRule from "@/hooks/useMutateGameRule";
import { toast } from "@/hooks/use-toast";
import { MdDeleteOutline } from "react-icons/md";
import { Spinner } from "../ui/spinner";

type Props = {
  rule: TGameRule;
  index: number;
};

const RuleItem = ({ rule, index }: Props) => {
  const [updatedRule, setUpdatedRule] = useState<TGameRule>(rule);
  const { editGameRuleQueryData, deleteGameRuleQueryData } =
    useSetGameQueryData();
  const { editGameRule, deleteGameRule } = useMutateGameRule({
    onSuccessEditGameRule: (rule) => {
      editGameRuleQueryData(rule);
    },
    onErrorEditGameRule: (error) => {
      toast({
        title: "Edit failed",
        description: error.message,
      });
    },
    onSuccessDeleteGameRule() {
      deleteGameRuleQueryData(rule);
    },
    onErrorDeleteGameRule(error) {
      toast({
        title: "Delete failed",
        description: error.message,
      });
    },
  });
  const isRuleChanged =
    updatedRule.divisibleNumber !== rule.divisibleNumber ||
    updatedRule.replacedWord !== rule.replacedWord;
  const handleUpdateRule = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!updatedRule.replacedWord || isNaN(updatedRule.divisibleNumber)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    if (!isRuleChanged) return;
    editGameRule.mutate({
      ruleId: rule.ruleId,
      divisibleNumber: updatedRule.divisibleNumber,
      replacedWord: updatedRule.replacedWord,
    });
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleUpdateRule();
      (e.target as HTMLInputElement).blur();
    }
  };
  return (
    <div
      data-testid={`rule-item-${rule.divisibleNumber}`}
      className="flex items-center justify-between w-full max-w-screen-sm  my-4 flex-wrap border-[1px] border-solid border-slate-400 px-2 rounded-sm text-sm"
    >
      <b>Rule {index + 1}:</b>
      <Input
        placeholder="Enter divisible number"
        className="placeholder:text-slate-400 w-full md:w-1/3 m-1 border-[0px] rounded-none !border-b-[1px] border-slate-400 shadow-none p-0 !text-xs h-fit"
        type="number"
        value={updatedRule.divisibleNumber}
        onChange={(e) => {
          setUpdatedRule(
            produce((draft) => {
              draft.divisibleNumber = Number(e.target.value || 0);
            })
          );
        }}
        onKeyDown={handleKeydown}
      />
      <Input
        placeholder="Enter replaced word"
        className="placeholder:text-slate-400 w-full md:w-1/3 m-1 border-[0px] rounded-none !border-b-[1px] border-slate-400 shadow-none p-0 !text-xs h-fit"
        value={updatedRule.replacedWord}
        onChange={(e) => {
          setUpdatedRule(
            produce((draft) => {
              draft.replacedWord = e.target.value;
            })
          );
        }}
        onKeyDown={handleKeydown}
      />
      <Button
        className=" m-1 ml-auto md:ml-2 !h-fit text-xs px-3 py-2"
        variant="dark"
        onClick={handleUpdateRule}
        disabled={Boolean(!isRuleChanged || editGameRule.isPending)}
      >
        {editGameRule.isPending ? "Updating..." : "Update"}
      </Button>
      {deleteGameRule.isPending ? (
        <Spinner size="small" className="text-red-500 pointer-events-none" />
      ) : (
        <MdDeleteOutline
          data-testid={`delete-rule-${rule.divisibleNumber}`}
          className="text-lg text-red-500 cursor-pointer"
          onClick={() => deleteGameRule.mutate(rule.ruleId)}
        />
      )}
    </div>
  );
};

export default RuleItem;
