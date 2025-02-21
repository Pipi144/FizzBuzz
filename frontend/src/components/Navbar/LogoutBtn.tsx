"use client";
import React from "react";
import AnimatedButton from "../AnimatedComponents/animated-button";
import { IoLogOutOutline } from "react-icons/io5";
import QuizAppRoutes from "@/RoutePaths";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
const LogoutBtn = () => {
  const router = useRouter();
  const { removeUser } = useAuthStore(
    useShallow((state) => ({ removeUser: state.removeUser }))
  );
  const logOut = () => {
    removeUser();
    router.replace(QuizAppRoutes.Home);
  };

  return (
    <AnimatedButton
      animatedVariants="fadeInRight"
      className="ml-[15px]"
      onClick={() => logOut()}
    >
      <IoLogOutOutline size={25} />
    </AnimatedButton>
  );
};

export default LogoutBtn;
