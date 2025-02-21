"use client";
import React, { useState } from "react";
import { AnimationProps, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TAuthState } from "@/models/AuthModels";
import useAuth from "@/hooks/useAuth";
import AppRoutes from "@/RoutePaths";
import * as z from "zod";
import { produce } from "immer";
import { findErrors } from "@/utils/helperFncs";
import { useRouter } from "next/navigation";

const schema = z.object({
  userName: z.string().min(5, "Username required and at least 5 characters"),
  password: z.string().min(1, "Password required"),
});
const RegisterForm = () => {
  const [registerState, setRegisterState] = useState<TAuthState>({
    userName: "",
    password: "",
  });
  const router = useRouter();

  const { register: registerMutation } = useAuth({
    registerProps: {
      onSuccessRegister: () => {
        router.push(AppRoutes.Login);
      },
      onErrorRegister: (err) => {
        setRegisterState(
          produce((draft) => {
            draft.serverErrors = [err.message];
          })
        );
      },
    },
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = schema.safeParse({
      userName: registerState.userName,
      password: registerState.password,
    });

    if (!validation.success) {
      setRegisterState(
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
    registerMutation.mutate({
      username: registerState.userName,
      password: registerState.password,
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
      <div className="grid w-full items-center gap-4 text-white">
        <motion.div className="flex flex-col space-y-1.5 " layout="position">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Enter your username..."
            name="username"
            value={registerState.userName}
            onChange={(e) =>
              setRegisterState(
                produce((draft) => {
                  draft.userName = e.target.value;
                })
              )
            }
          />

          {registerState.userNameErrors && (
            <motion.span
              className="text-red-500 text-[12px]"
              animate={animationConfig}
            >
              {registerState.userNameErrors.join(", ")}
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
            value={registerState.password}
            onChange={(e) =>
              setRegisterState(
                produce((draft) => {
                  draft.password = e.target.value;
                })
              )
            }
          />
          {registerState?.passwordErrors && (
            <motion.span
              className="text-red-500 text-[12px]"
              animate={animationConfig}
            >
              {registerState.passwordErrors.join(",")}
            </motion.span>
          )}
        </motion.div>

        {registerState?.serverErrors && (
          <motion.span
            className="text-red-500 text-[12px]"
            animate={animationConfig}
          >
            {registerState.serverErrors.join(",")}
          </motion.span>
        )}
      </div>

      <Button
        data-testid="submit-btn"
        variant="outline"
        className="w-full border-none mt-[30px] bg-white text-black hover:bg-white hover:text-black"
        type="submit"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <>
            Submitting...
            <Spinner size="medium" className="text-white " />
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </motion.form>
  );
};

export default RegisterForm;
