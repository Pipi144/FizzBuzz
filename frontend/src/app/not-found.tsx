import React from "react";
import { TbError404 } from "react-icons/tb";

const NotFound = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <span className="text-[25px] md:text-[35px] text-white font-concert mb-[20px]">
        Page not found
      </span>
      <TbError404 className="text-[150px] md:text-[200px] text-white" />
    </div>
  );
};

export default NotFound;
