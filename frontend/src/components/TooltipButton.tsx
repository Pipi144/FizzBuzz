import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {
  triggerComponent: React.ReactNode;
  content: string;
};

const TooltipButton = ({ triggerComponent, content }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>{triggerComponent}</TooltipTrigger>
        <TooltipContent
          className="shadow-lg border border-gray-200 bg-white text-gray-800 p-2 rounded-md"
          side="bottom"
          align="center"
        >
          <p>{content}</p>
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white shadow-md border border-gray-200" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipButton;
