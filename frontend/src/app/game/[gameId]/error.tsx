"use client";
import { Button } from "@/components/ui/button";
import AppRoutes from "@/RoutePaths";
import { useRouter } from "next/navigation";
import React from "react";
import { MdOutlineError } from "react-icons/md";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const router = useRouter();
  const handleReset = () => {
    reset();
    router.replace(AppRoutes.Home);
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <span className="text-[25px] md:text-[35px] text-black font-concert mb-[20px]">
        {error.message ?? "Something wrong!"}
      </span>

      <MdOutlineError className="text-[70px] md:text-[90px] text-black" />

      <Button
        variant="outline"
        className=" px-4 py-1 rounded-sm min-w-12 mt-5"
        onClick={handleReset}
      >
        Go home page
      </Button>
    </div>
  );
};

export default Error;
