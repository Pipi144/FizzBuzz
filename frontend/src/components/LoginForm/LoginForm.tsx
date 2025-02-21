"use client";

import { AnimationProps, motion } from "framer-motion";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { TAuthState } from "@/models/AuthModels";
import { Spinner } from "@/components/ui/spinner";
import * as z from "zod";
import { produce } from "immer";
import useAuth from "@/hooks/useAuth";
import { findErrors } from "@/utils/helperFncs";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import { useRouter } from "next/navigation";
import AppRoutes from "@/RoutePaths";

const schema = z.object({
  userName: z.string().min(5, "Username required and at least 5 characters"),
  password: z.string().min(1, "Password required"),
});
const LoginForm = () => {
  const [loginState, setLoginState] = useState<TAuthState>({
    userName: "",
    password: "",
  });
  const { setCurrentUser } = useAuthStore(
    useShallow((state) => ({ setCurrentUser: state.setCurrentUser }))
  );
  const router = useRouter();
  const { login: loginMutation } = useAuth({
    loginProps: {
      onSuccessLogin: (user) => {
        setCurrentUser(user);
        router.replace(AppRoutes.Home);
      },
      onErrorLogin: (err) =>
        setLoginState(
          produce((draft) => {
            draft.serverErrors = [err.message];
          })
        ),
    },
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = schema.safeParse({
      userName: loginState.userName,
      password: loginState.password,
    });

    if (!validation.success) {
      setLoginState(
        produce((draft) => {
          draft.userNameErrors = findErrors(
            "userName",
            validation.error.issues
          );
          draft.passwordErrors = findErrors(
            "password",
            validation.error.issues
          );
        })
      );

      return;
    }
    loginMutation.mutate({
      username: loginState.userName,
      password: loginState.password,
    });
  };

  const animationConfig: AnimationProps["animate"] = {
    y: [-5, 0],
    opacity: [0, 1],
    transition: {
      damping: 16,
      mass: 0.6,
      stiffness: 140,
    },
  };
  return (
    <motion.form
      onSubmit={handleSubmit}
      layout="size"
      transition={{ damping: 16, mass: 0.4, bounceDamping: 14 }}
    >
      <div className="grid w-full items-center gap-4 !text-white">
        <motion.div className="flex flex-col space-y-1.5" layout="position">
          <Label htmlFor="userName">Username</Label>
          <Input
            id="userName"
            placeholder="Enter your username..."
            name="userName"
            value={loginState?.userName}
            onChange={(e) => {
              setLoginState(
                produce((draft) => {
                  draft.userName = e.target.value;
                })
              );
            }}
          />

          {loginState?.userNameErrors && (
            <motion.span
              className="text-red-500 text-[12px]"
              animate={animationConfig}
            >
              {loginState.userNameErrors.join(", ")}
            </motion.span>
          )}
        </motion.div>
        <motion.div className="flex flex-col space-y-1.5" layout="position">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="Enter your password..."
            type="password"
            name="password"
            value={loginState?.password}
            onChange={(e) => {
              setLoginState(
                produce((draft) => {
                  draft.password = e.target.value;
                })
              );
            }}
          />
          {loginState?.passwordErrors && (
            <motion.span
              className="text-red-500 text-[12px]"
              animate={animationConfig}
            >
              {loginState.passwordErrors.join(",")}
            </motion.span>
          )}
        </motion.div>

        {loginState?.serverErrors && (
          <motion.span
            className="text-red-500 text-[12px]"
            animate={animationConfig}
          >
            {loginState.serverErrors.join(",")}
          </motion.span>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full bg-black text-white border-none mt-[30px]"
        type="submit"
        disabled={loginMutation.isPending}
      >
        Login
        {loginMutation.isPending && (
          <Spinner size="medium" className="text-white " />
        )}
      </Button>
    </motion.form>
  );
};

export default LoginForm;
