import { TBasicGameRule } from "@/models/gameRule";
import React from "react";
import { Label } from "../ui/label";
import AnimatedDiv from "../AnimatedComponents/AnimatedDiv";
import { IoClose } from "react-icons/io5";

type Props = {
  rule: TBasicGameRule;
  index: number;

  onRemoveRule?: (index: number) => void;
};

const RuleItemDisplay = ({ rule, index, onRemoveRule }: Props) => {
  return (
    <AnimatedDiv
      data-testid={`game-rule-${rule.divisibleNumber}`}
      className="w-fit  mb-5 flex flex-col space-y-1.5 !text-white bg-slate-500 rounded-sm px-2 py-1"
      animate={{ x: [5, 0], opacity: [0, 1] }}
      layout="position"
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Rule {index + 1}</Label>
        {onRemoveRule && (
          <IoClose
            className="text-xl ml-2 cursor-pointer"
            onClick={() => onRemoveRule(index)}
            data-testid={`remove-rule-${rule.divisibleNumber}`}
          />
        )}
      </div>

      <div className="mt-1 flex items-center space-x-2 text-sm">
        {`Number: ${rule.divisibleNumber} <---> Word: ${rule.replacedWord}`}
      </div>
    </AnimatedDiv>
  );
};

export default RuleItemDisplay;
