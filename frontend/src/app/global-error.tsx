"use client";
import React from "react";
import { MdOutlineError } from "react-icons/md";

const Error = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <span className="text-[25px] md:text-[35px] text-white font-concert mb-[20px]">
        Something wrong!
      </span>

      <MdOutlineError className="text-[150px] md:text-[200px] text-white" />
    </div>
  );
};

export default Error;
