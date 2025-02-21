import QuizAppRoutes from "@/RoutePaths";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import RegisterForm from "../../../components/RegisterForm/RegisterForm";

const Register = () => {
  return (
    <>
      <CardHeader className="items-center justify-center !text-white">
        <CardTitle role="heading">Register</CardTitle>
        <CardDescription className="md:text-[14px]">
          Already have an account?{" "}
          <Link
            href={QuizAppRoutes.Login}
            className="text-sky-600 hover:text-sky-300 transition-all duration-200 ease-linear "
          >
            Login
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </>
  );
};

export default Register;
