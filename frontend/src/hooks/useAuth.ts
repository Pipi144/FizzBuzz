import { loginApi, registerApi } from "@/apis/auth";
import { TAuthPayload } from "@/models/AuthModels";
import { TServerError } from "@/models/ServerErrorRespond";
import { TUser } from "@/models/user";
import { useMutation } from "@tanstack/react-query";

type TAuthProps = {
  loginProps?: {
    onSuccessLogin?: (user: TUser) => void;
    onErrorLogin?: (error: TServerError) => void;
  };
  registerProps?: {
    onSuccessRegister?: (user: TUser) => void;
    onErrorRegister?: (error: TServerError) => void;
  };
};
const useAuth = (authProps: TAuthProps = {}) => {
  const login = useMutation<TUser, TServerError, TAuthPayload>({
    mutationKey: ["login"],
    mutationFn: loginApi,
    onSuccess(res) {
      if (authProps?.loginProps?.onSuccessLogin)
        authProps?.loginProps?.onSuccessLogin(res);
    },
    onError(error) {
      if (authProps?.loginProps?.onErrorLogin)
        authProps?.loginProps?.onErrorLogin(error);
    },
  });

  const register = useMutation<TUser, TServerError, TAuthPayload>({
    mutationKey: ["register"],
    mutationFn: registerApi,
    onSuccess(res) {
      if (authProps?.registerProps?.onSuccessRegister)
        authProps?.registerProps?.onSuccessRegister(res);
    },
    onError(error) {
      if (authProps?.registerProps?.onErrorRegister)
        authProps?.registerProps?.onErrorRegister(error);
    },
  });

  return {
    login,
    register,
  };
};

export default useAuth;
