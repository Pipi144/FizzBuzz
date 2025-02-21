import React, { forwardRef } from "react";

type Props = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  name: string;
};

const CustomTextLogo = forwardRef<HTMLDivElement, Props>(
  ({ name, ...props }, ref) => {
    const nameArr = name.split("").filter((_, idx) => idx < 2);
    return (
      <div
        ref={ref}
        {...props}
        className="rounded-full  bg-cyan-400 px-2 aspect-square flex justify-center items-center"
      >
        {nameArr.map((word, index) => (
          <span
            key={index}
            className="text-base md:text-lg font-bold leading-none h-fit text-white"
          >
            {word.toUpperCase()}
          </span>
        ))}
      </div>
    );
  }
);

CustomTextLogo.displayName = "CustomTextLogo";
export default CustomTextLogo;
