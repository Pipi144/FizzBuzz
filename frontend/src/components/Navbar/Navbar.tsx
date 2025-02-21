"use client";
import Link from "next/link";
import React from "react";

import AnimatedButton from "../AnimatedComponents/animated-button";
import Image from "next/image";

import LogoutBtn from "./LogoutBtn";
import CustomTextLogo from "../CustomTextLogo";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import AppRoutes from "@/RoutePaths";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { currentUser } = useAuthStore(
    useShallow((state) => ({ currentUser: state.currentUser }))
  );
  const currentPath = usePathname();
  return (
    <div className="w-full fixed top-0 max-w-screen-lg p-[20px] self-center flex flex-row items-center">
      <Link
        href={AppRoutes.Home}
        className="cursor-pointer flex flex-row items-center"
      >
        <Image
          width={30}
          height={30}
          src={"/favicon.ico"}
          alt="Favicon"
          className="md:w-[40px] md:h-[50px] object-contain"
          priority={true}
        />
      </Link>

      {currentUser ? (
        <>
          <Link
            href={AppRoutes.Game}
            className={`mx-2 ${
              currentPath.startsWith(AppRoutes.Game)
                ? "text-cyan-400 font-bold"
                : "text-black font-[400]"
            } font-concert text-base hover:underline ml-5`}
          >
            Play Game
          </Link>
          <AnimatedButton className="ml-auto">
            <CustomTextLogo name={currentUser.username} />
          </AnimatedButton>
          <LogoutBtn />
        </>
      ) : (
        <>
          <Link
            href={AppRoutes.Login}
            className="px-[20px] py-[5px] rounded-sm ml-auto bg-white hover:bg-white hover:bg-opacity-80 text-black mr-[10px] border-solid border-[1px] border-btnDarkBorderColor"
          >
            Login
          </Link>
          <Link
            href={AppRoutes.Register}
            className="px-[20px] py-[5px] border-[1px] border-solid border-btnDarkBorderColor
         rounded-sm bg-btnDarkBgColor hover:bg-btnDarkHoverBgColor text-white 
         transition-all duration-200 ease-linear cursor-pointer"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
};

export default Navbar;
