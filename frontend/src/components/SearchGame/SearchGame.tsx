import { useGameContext } from "@/Providers/GameProvider";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import AnimatedButton from "../AnimatedComponents/animated-button";
import { IoClose } from "react-icons/io5";
import AnimatedDiv from "../AnimatedComponents/AnimatedDiv";

const SearchGame = () => {
  const [searchVal, setsearchVal] = useState("");
  const { setSearchGameValue } = useGameContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchGameValue(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  return (
    <AnimatedDiv
      className="flex items-center border-solid border-[1px] border-gray-400 rounded-sm px-3 py-1 overflow-hidden ml-auto"
      layout
    >
      <Input
        className="text-sm md-text-base font-concert border-none p-0 placeholder:text-gray-400 leading-none h-fit"
        placeholder="Search game..."
        value={searchVal}
        onChange={(e) => setsearchVal(e.target.value)}
      />

      {searchVal && (
        <AnimatedButton
          data-testid="clear-search-btn"
          animate={{ opacity: [0, 1] }}
          exit={{ opacity: 0 }}
          className="ml-2"
          layout="position"
          onClick={() => setsearchVal("")}
        >
          <IoClose className="text-black text-lg" />
        </AnimatedButton>
      )}
    </AnimatedDiv>
  );
};

export default SearchGame;
